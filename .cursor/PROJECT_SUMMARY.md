# 솔브릿지 시니어노트 프로젝트 요약

## 📋 프로젝트 개요

**프로젝트명**: 솔브릿지 시니어노트 (SoulBridge SeniorNote)  
**목적**: 요양시설과 환자(시니어), 보호자를 연결하는 소통 플랫폼  
**주요 특징**: AI 분석 리포트 자동 생성 (음성/텍스트/식사/활동 분석)

### 주요 변경사항
- **ORM 변경**: TypeORM → **Prisma**
- 기존 NestJS 보일러플레이트 활용
- API 명세는 Notion에 정의되어 있음

---

## 🎯 플랫폼 구성

1. **슈퍼관리자 페이지** (Frontend - Web)
2. **기관관리자 페이지** (Frontend - Web)  
3. **보호자 앱** (Android)
4. **요양보호사(보호사) 앱** (Android)

---

## 🔥 핵심 기능

### 1. 인증 및 사용자 관리
- 회원가입 (보호사/보호자)
- 로그인 (로컬/OAuth: Kakao, Google)
- 승인 시스템 (PENDING → APPROVED/REJECTED)
- 아이디 찾기 / 비밀번호 재설정

### 2. 케어로그 (시니어 활동 기록)
- 사진 기록 (최소 1개, 최대 3개)
- 음성 기록 (최소 1개, 최대 3개, 각 10초 이상)
- 식사/수면/감정/활동/배변 기록
- 복약 체크
- 댓글 및 좋아요 기능

### 3. AI 리포트 생성 ⭐
- 음성 분석
- 텍스트 분석
- 식사 기록 분석
- 활동 분석
- **PDF 리포트 자동 생성**

### 4. 긴급 호출 시스템
- 보호사 ↔ 보호자 양방향 호출
- 호출 유형: 긴급/낙상/건강이상/정서적이상/기타
- 대응 완료 처리 및 히스토리 관리

### 5. 문의 시스템
- 보호자 → 보호사/기관관리자/슈퍼관리자 문의
- 답변 기능
- 이미지 첨부 지원

### 6. 근태 관리
- 출근/퇴근 체크
- 캘린더 조회
- 근태 수정 요청

### 7. 교육 자료
- 교육 자료 업로드 (보호사용/보호자용)
- 이수 대상 설정
- 조회수 관리
- 첨부 파일 서명 URL 발급

### 8. 공지사항
- 공지 작성 (기관관리자/슈퍼관리자)
- 대상 설정 (전체/보호사/보호자)
- 첨부 파일 및 이미지 지원

---

## 🛠️ 기술 스택

### Backend
- **Framework**: NestJS v10.4.4 (Fastify)
- **ORM**: **Prisma** (TypeORM에서 변경)
- **Database**: PostgreSQL
- **Cache**: Redis (IORedis)
- **Queue**: BullMQ + Bull Board UI
- **Auth**: Better Auth v1.2.7
- **Logger**: Pino
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Build**: SWC

### API
- **REST API**: Swagger/OpenAPI 문서화
- **GraphQL**: Apollo Server v4.11.2
- **WebSocket**: Socket.io v4.8.1 (Redis Adapter)

### Infrastructure
- **Container**: Docker + Docker Compose
- **Cloud Storage**: AWS S3 또는 GCP Storage (서명 URL 사용)
- **Process Manager**: PM2

---

## 📁 프로젝트 구조

```
src/
├── api/                    # API 엔드포인트 모듈
│   ├── user/              # 사용자 관리
│   ├── carelog/           # 케어로그 (시니어 활동 기록)
│   ├── alert/             # 긴급 호출
│   ├── inquiry/           # 문의
│   ├── attendance/        # 근태
│   ├── education/         # 교육 자료
│   └── notice/            # 공지사항
├── auth/                   # 인증/인가 (Better Auth)
├── database/               # Prisma 관련
│   ├── prisma.service.ts
│   └── schema.prisma      # Prisma Schema
├── worker/                 # 백그라운드 작업 (BullMQ)
│   └── queues/
│       ├── email/         # 이메일 발송
│       └── ai-report/     # AI 리포트 생성
├── shared/
│   ├── cache/             # Redis 캐싱
│   ├── mail/              # 메일 발송
│   └── socket/            # WebSocket
└── config/                 # 설정
```

---

## 🚀 개발 우선순위

### Phase 1: 기반 구축 (2주)
- [x] NestJS 보일러플레이트 이해
- [ ] TypeORM → Prisma 마이그레이션
- [ ] 인증/인가 시스템 구축 (Better Auth)
- [ ] 사용자 관리 (회원가입, 로그인, 승인)
- [ ] 기관 관리

### Phase 2: 핵심 기능 (4주)
- [ ] 시니어 관리
- [ ] 케어로그 작성/조회
- [ ] 댓글 기능
- [ ] 긴급 호출 시스템
- [ ] 파일 업로드 (S3)

### Phase 3: 부가 기능 (3주)
- [ ] 문의 시스템
- [ ] 공지사항
- [ ] 교육자료
- [ ] 근태 관리

### Phase 4: AI 기능 (4주)
- [ ] AI 리포트 생성 큐 시스템
- [ ] 음성 분석 연동
- [ ] 텍스트 분석 연동
- [ ] 활동 분석 로직
- [ ] PDF 리포트 생성

### Phase 5: 최적화 및 배포 (2주)
- [ ] 성능 최적화
- [ ] 보안 강화
- [ ] 테스트 완료
- [ ] 프로덕션 배포

---

## 📊 주요 도메인 모델

### User (사용자)
```prisma
model User {
  id                      String   @id @default(uuid()) @db.Uuid
  name                    String
  phone                   String   @unique
  email                   String?  @unique
  loginId                 String?  @unique
  password                String?
  provider                Provider @default(LOCAL)
  role                    Role
  statusCode              StatusCode @default(PENDING)
  profileImageUrl         String?
  isNotificationEnabled   Boolean  @default(true)
  language                Language @default(KO)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  deletedAt               DateTime?
  
  caregiver               Caregiver?
  guardian                Guardian?
  
  @@map("users")
}
```

### Senior (시니어)
```prisma
model Senior {
  id                String   @id @default(uuid()) @db.Uuid
  seniorName        String
  birthdate         DateTime @db.Date
  seniorGender      Gender
  institutionId     String   @db.Uuid
  locationDetail    String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  
  institution       Institution @relation(fields: [institutionId], references: [id])
  carelogs          Carelog[]
  alerts            Alert[]
  inquiries         Inquiry[]
  
  @@map("seniors")
}
```

### Carelog (케어로그)
```prisma
model Carelog {
  id                String   @id @default(uuid()) @db.Uuid
  seniorId          String   @db.Uuid
  authorId          String   @db.Uuid
  date              DateTime @db.Date
  title             String   @db.VarChar(20)
  photos            Json     // Photo[]
  audios            Json     // AudioMeta[]
  tags              String[] // MEAL, EMOTION, SLEEP, ACTIVITY, BOWEL
  medication        Json     // { none, morning, lunch, dinner }
  sections          Json     // { meal, emotion, sleep, activity, bowel }
  notes             String?  @db.Text
  isAiReportExist   Boolean  @default(false)
  aiReportUrl       String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?
  
  senior            Senior     @relation(fields: [seniorId], references: [id])
  author            Caregiver  @relation(fields: [authorId], references: [id])
  comments          Comment[]
  
  @@map("carelogs")
}
```

---

## 🔐 인증 및 보안

### 1. 인증 방식
- **JWT Token** (Access Token)
- **Better Auth** 사용 (세션 관리)
- **OAuth**: Kakao, Google

### 2. 역할 기반 접근 제어 (RBAC)
```typescript
enum Role {
  CAREGIVER             // 요양보호사
  GUARDIAN              // 보호자
  INSTITUTION_MANAGER   // 기관 관리자
  SUPER_ADMIN          // 슈퍼 관리자
}
```

### 3. 승인 시스템
```typescript
enum StatusCode {
  PENDING    // 승인 대기
  APPROVED   // 승인됨
  REJECTED   // 반려됨
}
```

### 4. 보안 체크리스트
- [x] 비밀번호 해싱 (bcrypt)
- [x] JWT 토큰 만료 시간 설정
- [x] CORS 설정
- [x] Rate Limiting 적용 (Throttle)
- [ ] Input Validation
- [ ] XSS 방어
- [ ] SQL Injection 방어 (Prisma ORM 사용)
- [ ] 파일 업로드 검증

---

## 📝 API 설계 원칙

### 1. RESTful 규칙
```
GET     /resource       - 목록 조회
GET     /resource/:id   - 단건 조회
POST    /resource       - 생성
PUT     /resource/:id   - 전체 수정
PATCH   /resource/:id   - 부분 수정
DELETE  /resource/:id   - 삭제
```

### 2. 응답 형식
```typescript
// 단건 조회
{
  "id": "uuid",
  "name": "홍길동",
  ...
}

// 페이지네이션
{
  "items": [...],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 100,
  "totalPages": 5,
  "hasNext": true
}

// 에러 응답
{
  "statusCode": 400,
  "message": "잘못된 요청입니다",
  "error": "Bad Request"
}
```

### 3. 쿼리 파라미터
- **페이지네이션**: `pageNumber` (1부터), `pageSize` (기본 20, 최대 100)
- **정렬**: `orderBy` (DESC/ASC)
- **필터**: 명확한 이름 사용 (status, role, type 등)
- **날짜 범위**: `startDate`/`endDate` 또는 `from`/`to`

---

## 🧪 테스트 전략

### 1. 단위 테스트
- Service Layer 로직
- Utility 함수
- Validation 로직

### 2. 통합 테스트
- API 엔드포인트
- 데이터베이스 연동
- 외부 서비스 연동 (S3, AI API)

### 3. E2E 테스트
- 주요 사용자 시나리오
- 회원가입 → 로그인 → 케어로그 작성 → AI 리포트 생성

---

## 📈 성능 최적화

### 1. 데이터베이스
- N+1 쿼리 방지 (Prisma include/select 활용)
- 인덱스 적절히 설정
- Connection Pooling

### 2. 캐싱
- Redis 활용
- 자주 조회되는 데이터 캐싱 (기관 정보, 시니어 목록)
- TTL 설정

### 3. 파일 처리
- CDN 사용
- 이미지 최적화
- 서명 URL (만료 시간: 기본 5분)

### 4. 백그라운드 작업
- BullMQ로 비동기 처리
- AI 리포트 생성
- 이메일 발송

---

## 🔍 모니터링

### 1. 로깅
- **Pino**: 구조화된 로그
- 로그 레벨: ERROR, WARN, INFO, DEBUG

### 2. 메트릭
- **Prometheus**: 메트릭 수집
- API 응답 시간
- 에러율
- 데이터베이스 쿼리 성능

### 3. 대시보드
- **Grafana**: 실시간 대시보드
- **Bull Board**: 큐 모니터링

### 4. 에러 추적
- **Sentry**: 실시간 에러 알림

---

## 🚢 배포 전략

### 1. 환경
- **Development**: 로컬 개발
- **Staging**: 테스트 서버
- **Production**: 운영 서버

### 2. CI/CD
- GitHub Actions 또는 GitLab CI
- 자동 테스트 실행
- 자동 배포

### 3. 컨테이너
- **Docker**: 컨테이너화
- **Docker Compose**: 로컬 개발 환경
- **Kubernetes** (옵션): 프로덕션 오케스트레이션

### 4. 데이터베이스 마이그레이션
```bash
# 개발
npx prisma migrate dev

# 프로덕션
npx prisma migrate deploy
```

---

## 📚 참고 문서

### 1. 프로젝트 메모리
- `.cursor/solbridge-be-project-memory.md` - 보일러플레이트 구조
- `.cursor/solbridge-seniorNote-api-spec.md` - API 명세
- `.cursorrules` - 개발 규칙
- Notion API 문서 - 상세 API 정의

### 2. 기술 문서
- [NestJS 공식 문서](https://docs.nestjs.com/)
- [Prisma 공식 문서](https://www.prisma.io/docs/)
- [Better Auth 문서](https://www.better-auth.com/docs)
- [Socket.io 문서](https://socket.io/docs/)
- [BullMQ 문서](https://docs.bullmq.io/)

### 3. 개발 도구
- Prisma Studio: `npx prisma studio`
- Swagger UI: `http://localhost:3000/api`
- Bull Board: `http://localhost:3000/admin/queues`
- Grafana: `http://localhost:3001`

---

## 🎯 성공 기준

### 1. 기능 완성도
- [ ] 모든 API 엔드포인트 구현
- [ ] AI 리포트 생성 동작
- [ ] 실시간 알림 동작
- [ ] 파일 업로드/다운로드 동작

### 2. 성능
- [ ] API 응답 시간 < 200ms (평균)
- [ ] 동시 접속자 1000명 지원
- [ ] 에러율 < 1%

### 3. 보안
- [ ] 보안 취약점 0건
- [ ] 모든 API 인증/인가 적용
- [ ] 개인정보 암호화

### 4. 품질
- [ ] 테스트 커버리지 > 80%
- [ ] 문서화 완료
- [ ] 코드 리뷰 통과

---

## 📞 연락처 및 지원

### 개발팀
- **백엔드**: solbridge-be 팀
- **프론트엔드**: 웹/앱 개발팀
- **AI**: AI 분석팀

### 이슈 트래킹
- GitHub Issues 또는 Jira
- 버그 리포트
- 기능 요청

---

**최종 업데이트**: 2025-09-30  
**문서 버전**: 1.0
