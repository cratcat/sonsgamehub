const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 키 입력 상태
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// 에셋 (이미지 로드)
const playerImg = new Image();
playerImg.src = 'assets/Gemini_Generated_Image_czt7r2czt7r2czt7.png'; // 사용자가 첨부한 주인공 이미지

// 게임 객체 정의
const player = {
    x: 400, y: 300, width: 50, height: 50,
    speed: 4, defaultSpeed: 4,
    color: '#3498db', hp: 100, maxHp: 100,
    facing: 'down', attackCooldown: 0,
    isRiding: false,
    attackMotion: 0
};

const projectiles = [];
const particles = [];

// 적 배열
let enemies = [
    { type: '선인장', x: 200, y: 150, width: 40, height: 60, color: '#27ae60', hp: 50, speed: 0, dx: 0, dy: 0 },
    { type: '거북이', x: 600, y: 400, width: 50, height: 40, color: '#16a085', hp: 80, speed: 1.5, dx: -1, dy: 0 },
    { type: '바지맨', x: 700, y: 100, width: 45, height: 70, color: '#2980b9', hp: 120, speed: 2, dx: 0, dy: 0, isChasing: true } // 필수 요소
];

// NPC 및 탈것
let npcs = [
    { type: '요시', x: 100, y: 500, width: 60, height: 60, color: '#2ecc71', isRidden: false },
    { type: '커비', x: 500, y: 200, width: 40, height: 40, color: '#ff9ff3', dx: 1, dy: 1, speed: 1 }
];

// 게임 루프 타이머
let lastTime = 0;

// 발사체 추가 함수
function shootProjectile() {
    let vx = 0, vy = 0;
    const speed = 10;
    if(player.facing === 'up') vy = -speed;
    if(player.facing === 'down') vy = speed;
    if(player.facing === 'left') vx = -speed;
    if(player.facing === 'right') vx = speed;
    
    projectiles.push({
        x: player.x + player.width/2 - 5,
        y: player.y + player.height/2 - 5,
        width: 10, height: 10,
        vx: vx, vy: vy,
        color: player.isRiding ? '#f1c40f' : '#e74c3c' // 요시를 타면 투사체 색상 변경
    });
}

// 충돌 감지 로직
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// 업데이트 로직
function update() {
    // 플레이어 이동
    let dx = 0, dy = 0;
    if (keys['ArrowUp']) { dy = -1; player.facing = 'up'; }
    if (keys['ArrowDown']) { dy = 1; player.facing = 'down'; }
    if (keys['ArrowLeft']) { dx = -1; player.facing = 'left'; }
    if (keys['ArrowRight']) { dx = 1; player.facing = 'right'; }
    
    // 대각선 이동 시 속도 정규화
    if (dx !== 0 && dy !== 0) {
        dx *= 0.707; dy *= 0.707;
    }
    
    player.x += dx * player.speed;
    player.y += dy * player.speed;
    
    // 화면 경계선 제한
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

    // 쿨타임 감소
    if (player.attackCooldown > 0) player.attackCooldown--;
    if (player.attackMotion > 0) player.attackMotion--;

    // 근거리 공격 (Z)
    if (keys['z'] && player.attackCooldown === 0) {
        player.attackMotion = 15;
        player.attackCooldown = 30;
        
        // 근접 공격 범위 설정
        let hitbox = {x: player.x, y: player.y, width: player.width, height: player.height};
        const range = 40;
        if(player.facing === 'up') { hitbox.y -= range; hitbox.height += range; }
        if(player.facing === 'down') { hitbox.height += range; }
        if(player.facing === 'left') { hitbox.x -= range; hitbox.width += range; }
        if(player.facing === 'right') { hitbox.width += range; }

        enemies.forEach(enemy => {
            if (isColliding(hitbox, enemy)) {
                enemy.hp -= player.isRiding ? 50 : 30;
            }
        });
    }

    // 원거리 공격 (X)
    if (keys['x'] && player.attackCooldown === 0) {
        shootProjectile();
        player.attackCooldown = 40;
    }
    
    // 탈 것 상호작용 (C)
    if (keys['c'] && player.attackCooldown === 0) {
        player.attackCooldown = 30;
        if (player.isRiding) {
            // 내리기
            player.isRiding = false;
            player.speed = player.defaultSpeed;
            // 요시 재생성
            npcs.push({ type: '요시', x: player.x, y: player.y + 60, width: 60, height: 60, color: '#2ecc71', isRidden: false });
        } else {
            // 타기 체크
            for (let i = 0; i < npcs.length; i++) {
                if (npcs[i].type === '요시' && isColliding(player, npcs[i])) {
                    player.isRiding = true;
                    player.speed = player.defaultSpeed * 1.5; // 속도 증가
                    npcs.splice(i, 1);
                    break;
                }
            }
        }
    }

    // 투사체 업데이트
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // 화면 밖 제거
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // 적 충돌 검사
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (isColliding(p, enemies[j])) {
                enemies[j].hp -= 40;
                projectiles.splice(i, 1);
                break;
            }
        }
    }

    // 적 업데이트 및 처치
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        
        if (e.hp <= 0) {
            enemies.splice(i, 1);
            continue;
        }

        // 바지맨 AI (플레이어 추적)
        if (e.isChasing) {
            let angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
        } else {
            // 단순 이동 (거북이)
            e.x += e.dx * e.speed;
            e.y += e.dy * e.speed;
            if (e.x < 100 || e.x > 700) e.dx *= -1; // 임의의 반전 로직
        }
        
        // 플레이어 피격
        if (isColliding(player, e)) {
            // 무적 시간이나 간단한 넉백 추가 가능
        }
    }
    
    // 커비 (NPC) 업데이트 (랜덤 튕기기)
    npcs.forEach(npc => {
        if (npc.type === '커비') {
            npc.x += npc.dx * npc.speed;
            npc.y += npc.dy * npc.speed;
            if (npc.x <= 0 || npc.x + npc.width >= canvas.width) npc.dx *= -1;
            if (npc.y <= 0 || npc.y + npc.height >= canvas.height) npc.dy *= -1;
        }
    });
}

// 그리기 로직
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 맵 장식 (픽사베이 이미지 대신 간단한 도형으로 예시)
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(50, 50, 100, 100); // 장애물 예시
    ctx.fillRect(650, 450, 80, 80);

    // 적 그리기
    enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.fillRect(e.x, e.y, e.width, e.height);
        
        // 이름표
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(e.type, e.x, e.y - 15);
        
        // 체력바
        ctx.fillStyle = 'red';
        ctx.fillRect(e.x, e.y - 10, e.width, 5);
        ctx.fillStyle = 'lightgreen';
        ctx.fillRect(e.x, e.y - 10, e.width * (e.hp / (e.type==='바지맨'?120:e.type==='거북이'?80:50)), 5);
        
        // 바지맨의 경우 바지 디테일
        if(e.type === '바지맨') {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(e.x, e.y + e.height/2, e.width, e.height/2);
        }
    });

    // NPC 그리기
    npcs.forEach(npc => {
        ctx.fillStyle = npc.color;
        if(npc.type === '커비') {
            ctx.beginPath();
            ctx.arc(npc.x + npc.width/2, npc.y + npc.height/2, npc.width/2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
        }
        ctx.fillStyle = 'black';
        ctx.fillText(npc.type, npc.x, npc.y - 5);
    });

    // 투사체 그리기
    projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width/2, 0, Math.PI*2);
        ctx.fill();
    });

    // 플레이어 그리기
    ctx.save();
    
    // 탑승 상태 시 이펙트 (요시)
    if (player.isRiding) {
        ctx.fillStyle = '#2ecc71'; // 요시 색상
        ctx.fillRect(player.x - 10, player.y + 20, player.width + 20, player.height);
    }
    
    if (playerImg.complete && playerImg.naturalWidth !== 0) {
        // 이미지가 정상 로드되었을 때
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    } else {
        // 이미지 로드 실패 시 대체 도형 (로봇 느낌)
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        // 눈
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 10, player.y + 10, 10, 10);
        ctx.fillRect(player.x + 30, player.y + 10, 10, 10);
    }

    // 공격 모션 이펙트 (근접 공격)
    if (player.attackMotion > 0) {
        ctx.fillStyle = 'rgba(231, 76, 60, 0.5)';
        ctx.beginPath();
        if(player.facing === 'up') ctx.arc(player.x + player.width/2, player.y, 30, Math.PI, 0);
        if(player.facing === 'down') ctx.arc(player.x + player.width/2, player.y + player.height, 30, 0, Math.PI);
        if(player.facing === 'left') ctx.arc(player.x, player.y + player.height/2, 30, Math.PI/2, Math.PI*1.5);
        if(player.facing === 'right') ctx.arc(player.x + player.width, player.y + player.height/2, 30, -Math.PI/2, Math.PI/2);
        ctx.fill();
    }
    
    ctx.restore();
    
    // UI 그리기 (플레이어 체력바 등)
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Player HP: ${player.hp}`, 20, 30);
}

// 메인 루프
function gameLoop(timestamp) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 게임 시작
requestAnimationFrame(gameLoop);
