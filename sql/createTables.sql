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
  "city" VARCHAR
);

CREATE TABLE IF NOT EXISTS "pets" (
  "petId" BIGSERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "petName" VARCHAR NOT NULL,
  "petAge" INTEGER,
  "birthday" DATE,
  "type" VARCHAR,
  "breed" VARCHAR,
  "size" VARCHAR,
  "socialLevel" VARCHAR,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "post" (
  "id" BIGSERIAL PRIMARY KEY,
  "body" TEXT,
  "userId" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS  "post_media" (
  "id" SERIAL PRIMARY KEY,
  "postId" INTEGER NOT NULL REFERENCES "post"("id") ON DELETE CASCADE,
  "imageUrl" TEXT NOT NULL,
  "mediaType" text CHECK (media_type IN ('image', 'video')) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "chatInfo" (
  "chatID" bigserial PRIMARY KEY
);

CREATE TABLE "chatUsers" (
  "chatID" bigint REFERENCES "chatInfo"("chatID") ON DELETE CASCADE,
  "userID" bigint REFERENCES "users"("id") ON DELETE CASCADE,
  PRIMARY KEY ("chatID", "userID")
);

CREATE TABLE "messages" (
  "messageId" bigserial PRIMARY KEY,
  "chatId" bigint REFERENCES "chatInfo"("chatID") ON DELETE CASCADE,
  "senderId" bigint REFERENCES "users"("id"),
  "message" text,
  "timeSent" timestamp DEFAULT now(),
  "timeRead" timestamp
);



-- -- FOLLOWERS TABLE (Optional but recommended)
-- CREATE TABLE "follows" (
--   "followerId" INTEGER NOT NULL,
--   "followedId" INTEGER NOT NULL,
--   PRIMARY KEY ("followerId", "followedId"),
--   FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE,
--   FOREIGN KEY ("followedId") REFERENCES "users"("id") ON DELETE CASCADE
-- );




-- CREATE TABLE "calendar" (
--   "userId" integer,
--   "petId" bigint,
--   "dayTime" time,
--   "eventTime" time,
--   "eventType" varchar,
--   "title" varchar,
--   "description" varchar
-- );

-- CREATE TABLE "medInfo" (
--   "petId" bigint PRIMARY KEY,
--   "medId" bigint,
--   "vetName" varchar,
--   "dayOf" time,
--   "briefDesc" varchar,
--   "thoroughDesc" varchar
-- );

-- CREATE TABLE "chatInfo" (
--   "chatID" bigserial PRIMARY KEY,
--   "users" integer
-- );

-- CREATE TABLE "messages" (
--   "chatId" bigserial PRIMARY KEY,
--   "messageId" bigserial,
--   "message" varchar,
--   "timeSent" time,
--   "timeRead" time
-- );

-- CREATE TABLE "forumTopic" (
--   "topicId" serial PRIMARY KEY,
--   "topicName" varchar,
--   "topicDesc" varchar
-- );

-- CREATE TABLE "forumSubTopic" (
--   "subTopicId" serial PRIMARY KEY,
--   "inTopicId" integer,
--   "subTopicName" varchar,
--   "subTopicDesc" varchar
-- );

-- CREATE TABLE "forumThread" (
--   "threadId" serial PRIMARY KEY,
--   "inSubTopicId" integer,
--   "threadUser" integer,
--   "threadTitle" varchar
-- );

-- CREATE TABLE "forumPost" (
--   "forumPostId" bigserial PRIMARY KEY,
--   "postUserId" integer,
--   "postThreadId" integer,
--   "postTitle" varchar,
--   "postContent" varchar,
--   "postLikes" integer,
--   "replyFrom" integer
-- );

-- CREATE TABLE "community" (
--   "communityId" serial PRIMARY KEY,
--   "managerId" integer,
--   "adminId" integer,
--   "communityName" varchar,
--   "communityDesc" varchar
-- );

-- CREATE TABLE "publicEvent" (
--   "userId" integer,
--   "eventId" serial PRIMARY KEY,
--   "eventTitle" varchar,
--   "eventDate" date,
--   "eventTimeFrom" time,
--   "eventTimeTo" time,
--   "eventDesc" varchar,
--   "eventLoc" varchar
-- );

-- COMMENT ON COLUMN "post"."body" IS 'Content of the post';

-- ALTER TABLE "post" ADD FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- ALTER TABLE ""pet"" ADD FOREIGN KEY ("userId") REFERENCES "medInfo" ("petId");

-- ALTER TABLE ""pet"" ADD FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- ALTER TABLE "calendar" ADD FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE;

-- ALTER TABLE ""pet"" ADD FOREIGN KEY ("petId") REFERENCES "calendar" ("petId");

-- ALTER TABLE "messages" ADD FOREIGN KEY ("chatId") REFERENCES "chatInfo" ("chatID");

-- ALTER TABLE "forumPosts" ADD FOREIGN KEY ("forumPostId") REFERENCES "forumPosts" ("replyFrom");

-- ALTER TABLE "forumSubTopic" ADD FOREIGN KEY ("inTopicId") REFERENCES "forumTopic" ("topicId");

-- ALTER TABLE "forumSubTopic" ADD FOREIGN KEY ("subTopicId") REFERENCES "forumsThread" ("inSubTopicId");

-- ALTER TABLE "forumsThread" ADD FOREIGN KEY ("threadId") REFERENCES "forumPosts" ("postThreadId");

-- CREATE TABLE "users_chatInfo" (
--   "users_id" serial,
--   "chatInfo_chatID" bigserial,
--   PRIMARY KEY ("users_id", "chatInfo_chatID")
-- );

-- ALTER TABLE "users_chatInfo" ADD FOREIGN KEY ("users_id") REFERENCES "users" ("id");

-- ALTER TABLE "users_chatInfo" ADD FOREIGN KEY ("chatInfo_chatID") REFERENCES "chatInfo" ("chatID");


-- CREATE TABLE "publicEvent_community" (
--   "publicEvent_eventId" serial,
--   "community_communityId" serial,
--   PRIMARY KEY ("publicEvent_eventId", "community_communityId")
-- );

-- ALTER TABLE "publicEvent_community" ADD FOREIGN KEY ("publicEvent_eventId") REFERENCES "publicEvent" ("eventId");

-- ALTER TABLE "publicEvent_community" ADD FOREIGN KEY ("community_communityId") REFERENCES "community" ("communityId");
