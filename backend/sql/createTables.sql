CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR NOT NULL UNIQUE,
  "username" VARCHAR NOT NULL UNIQUE,
  "password" VARCHAR NOT NULL,
  "role" VARCHAR,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "numPets" INTEGER,
  "birthday" DATE,
  "status" VARCHAR,
  "country" VARCHAR,
  "state" VARCHAR,
  "city" VARCHAR,
  "avatar" VARCHAR,
  "bio" TEXT
);

CREATE TABLE IF NOT EXISTS "pets" (
  "petId" BIGSERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "petName" VARCHAR NOT NULL,
  "birthday" DATE,
  "breed" VARCHAR,
  "size" VARCHAR,
  "socialLevel" VARCHAR,
  "avatar" VARCHAR,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "post" (
  "id" BIGSERIAL PRIMARY KEY,
  "body" TEXT,
  "userId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS  "post_media" (
  "id" SERIAL PRIMARY KEY,
  "postId" BIGINT NOT NULL REFERENCES "post"("id") ON DELETE CASCADE,
  "imageUrl" TEXT NOT NULL,
  "mediaType" TEXT CHECK ("mediaType" IN ('image', 'video')) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "chatInfo" (
  "chatID" bigserial PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "chatUsers" (
  "chatID" bigint REFERENCES "chatInfo"("chatID") ON DELETE CASCADE,
  "userID" bigint REFERENCES "users"("id") ON DELETE CASCADE,
  PRIMARY KEY ("chatID", "userID")
);

CREATE TABLE IF NOT EXISTS "messages" (
  "messageId" bigserial PRIMARY KEY,
  "chatId" bigint REFERENCES "chatInfo"("chatID") ON DELETE CASCADE,
  "senderId" bigint REFERENCES "users"("id"),
  "message" text,
  "mediaUrl" text,
  "mediaType" text CHECK ("mediaType" IN ('image', 'video')),
  "timeSent" timestamp DEFAULT now(),
  "timeRead" timestamp
);

CREATE TABLE IF NOT EXISTS "follows" (
  "followerId" INTEGER NOT NULL,
  "followedId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("followerId", "followedId"),
  FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("followedId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "forumTopics" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS "forumThreads" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR NOT NULL,
  "content" TEXT NOT NULL,
  "userId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "topicId" INTEGER NOT NULL REFERENCES "forumTopics"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "forumReplies" (
  "id" SERIAL PRIMARY KEY,
  "threadId" INTEGER REFERENCES "forumThreads"("id") ON DELETE CASCADE,
  "userId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "postLikes" (
  "userId" INTEGER NOT NULL,
  "postId" BIGINT NOT NULL,
  "likedAt" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("userId", "postId"),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "comments" (
  "id" SERIAL PRIMARY KEY,
  "postId" BIGINT REFERENCES "post"("id") ON DELETE CASCADE,
  "userId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "comment" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "events" (
  --baseline
  "id" SERIAL PRIMARY KEY,
  "owner_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  --from user
  "title" VARCHAR NOT NULL,
  "event_type" VARCHAR NOT NULL,
  "location" VARCHAR,
  "notes" VARCHAR,
  "pet" VARCHAR REFERENCES "petName",
  "time" TIMESTAMP NOT NULL,
  --memorybank info
  "index" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE IF NOT EXISTS "events" (
  --baseline
  "id" SERIAL PRIMARY KEY,
  "event_id" INTEGER NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  --from user
  "shared_with_user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "permission" VARCHAR NOT NULL CHECK ("permission" IN ('view', 'edit')),
  UNIQUE("event_id", "shared_with_user_id")
);

CREATE TABLE "shared_events" (
  "id" SERIAL PRIMARY KEY

  "event_id" INTEGER NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "shared_with_user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "shared_by_user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE SET NULL,
  "permission" VARCHAR NOT NULL CHECK ("permission" IN ('view', 'edit')),

)
INSERT INTO "shared_events" ("event_id", "shared_with_user_id", "shared_by_user_id", "permission") VALUES
VALUES ($1, $2, $3)
ON CONFLICT ("event_id", "shared_with_user_id") DO UPDATE
SET "permission" = EXCLUDED.permission,
    "shared_by_user_id" = EXCLUDED.shared_by_user_id,
    "shared_at" = CURRENT_TIMESTAMP;

INSERT INTO "forumTopics" ("name") VALUES
  ('Training'),
  ('Toys'),
  ('Nutrition'),
  ('Health'),
  ('Behavior'),
  ('General')
ON CONFLICT ("name") DO NOTHING;



CREATE INDEX IF NOT EXISTS idx_comments_postId ON "comments"("postId");
CREATE INDEX IF NOT EXISTS idx_postLikes_postId ON "postLikes"("postId");
CREATE INDEX IF NOT EXISTS idx_post_media_postId ON "post_media"("postId");
