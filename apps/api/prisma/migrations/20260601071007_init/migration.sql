-- CreateTable
CREATE TABLE `positions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` JSON NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `people` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` JSON NOT NULL,
    `position_id` BIGINT NOT NULL,
    `bio` JSON NOT NULL,
    `photo_url` VARCHAR(512) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `people_position_id_idx`(`position_id`),
    INDEX `people_is_published_idx`(`is_published`),
    INDEX `people_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subjects` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(8) NOT NULL,
    `title` JSON NOT NULL,
    `hours` VARCHAR(32) NOT NULL,
    `color` VARCHAR(32) NOT NULL,
    `items` JSON NOT NULL,
    `lead_person_id` BIGINT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `subjects_lead_person_id_idx`(`lead_person_id`),
    INDEX `subjects_is_published_idx`(`is_published`),
    INDEX `subjects_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `person_subjects` (
    `person_id` BIGINT NOT NULL,
    `subject_id` BIGINT NOT NULL,

    INDEX `person_subjects_subject_id_idx`(`subject_id`),
    PRIMARY KEY (`person_id`, `subject_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` JSON NOT NULL,
    `quote` JSON NOT NULL,
    `teacher_id` BIGINT NULL,
    `story` JSON NOT NULL,
    `duration` VARCHAR(32) NOT NULL,
    `photo_url` VARCHAR(512) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `students_teacher_id_idx`(`teacher_id`),
    INDEX `students_is_published_idx`(`is_published`),
    INDEX `students_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` JSON NOT NULL,
    `description` JSON NULL,
    `provider` VARCHAR(128) NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `courses_is_published_idx`(`is_published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_courses` (
    `student_id` BIGINT NOT NULL,
    `course_id` BIGINT NOT NULL,

    INDEX `student_courses_course_id_idx`(`course_id`),
    PRIMARY KEY (`student_id`, `course_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_blocks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `time` TIME(0) NOT NULL,
    `title` JSON NOT NULL,
    `category` ENUM('prayer', 'study', 'meal', 'spirit', 'personal') NOT NULL,
    `description` JSON NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `daily_blocks_sort_order_idx`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_slots` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `subject_id` BIGINT NOT NULL,
    `person_id` BIGINT NOT NULL,
    `days` JSON NOT NULL,
    `start_time` TIME(0) NOT NULL,
    `end_time` TIME(0) NOT NULL,

    INDEX `schedule_slots_subject_id_idx`(`subject_id`),
    INDEX `schedule_slots_person_id_idx`(`person_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `campaign` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` JSON NOT NULL,
    `goal_amount` DECIMAL(12, 2) NOT NULL,
    `raised_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `currency` VARCHAR(8) NOT NULL DEFAULT 'ILS',
    `ends_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `campaign_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donors` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `campaign_id` BIGINT NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `donated_at` DATETIME(3) NOT NULL,
    `is_anonymous` BOOLEAN NOT NULL DEFAULT false,

    INDEX `donors_campaign_id_idx`(`campaign_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(128) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contact_messages_is_read_idx`(`is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_content` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `content_key` VARCHAR(128) NOT NULL,
    `value` JSON NOT NULL,
    `page_group` VARCHAR(64) NOT NULL,

    UNIQUE INDEX `site_content_content_key_key`(`content_key`),
    INDEX `site_content_page_group_idx`(`page_group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_login_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `people` ADD CONSTRAINT `people_position_id_fkey` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_lead_person_id_fkey` FOREIGN KEY (`lead_person_id`) REFERENCES `people`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `person_subjects` ADD CONSTRAINT `person_subjects_person_id_fkey` FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `person_subjects` ADD CONSTRAINT `person_subjects_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `people`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `student_courses_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_slots` ADD CONSTRAINT `schedule_slots_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule_slots` ADD CONSTRAINT `schedule_slots_person_id_fkey` FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donors` ADD CONSTRAINT `donors_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
