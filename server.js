const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 서빙 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// MySQL 연결 설정
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'froggy_home'
});

// DB 연결
db.connect(err => {
    if (err) {
        console.error('❌ DB 연결 실패:', err);
        console.log('⚠️ DB 없이 서버를 시작합니다. DB 연결 후 다시 시작하세요.');
    } else {
        console.log('✅ MySQL DB 연결 성공!');
    }
});

// =====================
// API 라우트
// =====================

// 1. 캐릭터 카드 전체 조회
app.get('/api/characters', (req, res) => {
    db.query('SELECT * FROM character_cards ORDER BY id DESC', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'DB 조회 실패' });
        }
        res.json(results);
    });
});

// 2. 캐릭터 카드 추가
app.post('/api/characters', (req, res) => {
    const { name, desc, img, link } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: '이름은 필수입니다.' });
    }

    db.query(
        'INSERT INTO character_cards (name, description, image_url, link) VALUES (?, ?, ?, ?)',
        [name, desc || '', img || '', link || '#'],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: '캐릭터 추가 실패' });
            }
            res.json({ 
                id: result.insertId, 
                name, 
                desc, 
                img, 
                link,
                message: '캐릭터가 추가되었습니다!' 
            });
        }
    );
});

// 3. 캐릭터 카드 수정
app.put('/api/characters/:id', (req, res) => {
    const { id } = req.params;
    const { name, desc, img, link } = req.body;

    db.query(
        'UPDATE character_cards SET name = ?, description = ?, image_url = ?, link = ? WHERE id = ?',
        [name, desc, img, link, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: '캐릭터 수정 실패' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: '해당 캐릭터를 찾을 수 없습니다.' });
            }
            res.json({ message: '캐릭터가 수정되었습니다!' });
        }
    );
});

// 4. 캐릭터 카드 삭제
app.delete('/api/characters/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM character_cards WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: '캐릭터 삭제 실패' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '해당 캐릭터를 찾을 수 없습니다.' });
        }
        res.json({ message: '캐릭터가 삭제되었습니다!' });
    });
});

// 5. 판매 캐릭터 조회
app.get('/api/sales', (req, res) => {
    db.query('SELECT * FROM sales_characters ORDER BY id DESC', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'DB 조회 실패' });
        }
        res.json(results);
    });
});

// 6. 판매 캐릭터 추가
app.post('/api/sales', (req, res) => {
    const { name, desc, img, link } = req.body;

    db.query(
        'INSERT INTO sales_characters (name, description, image_url, trade_link) VALUES (?, ?, ?, ?)',
        [name, desc, img, link],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: '판매 캐릭터 추가 실패' });
            }
            res.json({ 
                id: result.insertId, 
                name, 
                desc, 
                img, 
                link,
                message: '판매 캐릭터가 추가되었습니다!' 
            });
        }
    );
});

// 7. 커미션 신청 저장
app.post('/api/commission-apply', (req, res) => {
    const { type, name, contact, character, extra } = req.body;

    db.query(
        'INSERT INTO commission_applications (type, name, contact, character_info, extra_request) VALUES (?, ?, ?, ?, ?)',
        [type, name, contact, character, extra || ''],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: '커미션 신청 실패' });
            }
            res.json({ 
                id: result.insertId,
                message: '커미션 신청이 완료되었습니다!' 
            });
        }
    );
});

// 8. 마스터 로그인 체크 (간단 버전)
app.post('/api/master-login', (req, res) => {
    const { password } = req.body;
    const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'frog123';

    if (password === MASTER_PASSWORD) {
        res.json({ 
            success: true, 
            message: '로그인 성공!',
            token: 'master-token-' + Date.now() // 실제로는 JWT 사용 권장
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: '비밀번호가 틀렸습니다.' 
        });
    }
});

// =====================
// 기본 라우트
// =====================

// 루트 경로 - index.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 핸들러
app.use((req, res) => {
    res.status(404).send('페이지를 찾을 수 없습니다.');
});

// =====================
// 서버 시작
// =====================
app.listen(PORT, () => {
    console.log(`🐸 서버가 http://localhost:${PORT} 에서 실행 중입니다!`);
});