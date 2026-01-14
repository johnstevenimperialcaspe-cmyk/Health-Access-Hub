-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 07, 2026 at 12:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `thesis1`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `user_type` enum('student','faculty') NOT NULL DEFAULT 'student',
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `duration` int(11) DEFAULT 30,
  `purpose` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('scheduled','confirmed','in_progress','completed','cancelled','no_show') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `student_id`, `user_id`, `user_type`, `appointment_date`, `appointment_time`, `duration`, `purpose`, `notes`, `status`, `created_at`, `updated_at`) VALUES
(43, NULL, 13, 'student', '2025-12-03', '16:15:00', 30, 'Follow Up', NULL, 'confirmed', '2025-12-03 10:15:50', '2025-12-03 10:16:39'),
(44, NULL, 13, 'student', '2025-12-04', '12:25:00', 30, 'Pre-Enrollment', NULL, 'confirmed', '2025-12-03 10:25:49', '2025-12-03 10:26:50'),
(45, NULL, 16, 'student', '2025-12-04', '14:04:00', 30, 'Consultation', NULL, 'confirmed', '2025-12-04 06:04:19', '2025-12-04 22:13:50'),
(48, NULL, 32, 'student', '2025-12-05', '10:55:00', 30, 'Pre-Enrollment', NULL, 'confirmed', '2025-12-04 23:55:38', '2025-12-04 23:59:49');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `actor_id` int(10) UNSIGNED NOT NULL,
  `action` varchar(50) NOT NULL,
  `target_model` varchar(50) NOT NULL,
  `target_id` varchar(50) NOT NULL,
  `summary` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `actor_id`, `action`, `target_model`, `target_id`, `summary`, `ip_address`, `metadata`, `created_at`) VALUES
(36, 13, 'CREATE', 'Appointment', '12', 'Booked appointment for 2025-11-18', '::1', NULL, '2025-11-17 14:15:20'),
(37, 13, 'CREATE', 'HealthRecord', '5', 'Created examination', '::1', NULL, '2025-11-21 02:33:47'),
(38, 16, 'CREATE', 'HealthRecord', '6', 'Created examination', '::1', NULL, '2025-11-21 03:33:13'),
(39, 16, 'CREATE', 'Appointment', '13', 'Booked appointment for 2025-11-24', '::1', NULL, '2025-11-21 03:36:18'),
(40, 16, 'CREATE', 'Appointment', '14', 'Booked appointment for 2025-11-24', '::1', NULL, '2025-11-21 03:36:22'),
(41, 16, 'CREATE', 'Appointment', '15', 'Booked appointment for 2025-11-24', '::1', NULL, '2025-11-21 03:36:23'),
(42, 16, 'CREATE', 'Appointment', '16', 'Booked appointment for 2025-11-24', '::1', NULL, '2025-11-21 03:36:24'),
(43, 16, 'CREATE', 'Appointment', '17', 'Booked appointment for 2025-11-24', '::1', NULL, '2025-11-21 03:36:24'),
(44, 16, 'CREATE', 'Appointment', '18', 'Booked appointment for 2025-11-24', '::1', NULL, '2025-11-21 03:36:24'),
(45, 16, 'CREATE', 'Appointment', '19', 'Booked appointment for 2025-11-24', '::1', NULL, '2025-11-21 03:36:26'),
(46, 16, 'CREATE', 'Appointment', '20', 'Booked appointment for 2025-11-24', '::1', NULL, '2025-11-21 03:36:29'),
(47, 16, 'DELETE', 'Appointment', '20', 'Cancelled appointment', '::1', NULL, '2025-11-21 03:36:37'),
(48, 16, 'DELETE', 'Appointment', '19', 'Cancelled appointment', '::1', NULL, '2025-11-21 03:36:40'),
(49, 16, 'DELETE', 'Appointment', '18', 'Cancelled appointment', '::1', NULL, '2025-11-21 03:36:43'),
(50, 16, 'DELETE', 'Appointment', '17', 'Cancelled appointment', '::1', NULL, '2025-11-21 03:36:45'),
(51, 16, 'DELETE', 'Appointment', '16', 'Cancelled appointment', '::1', NULL, '2025-11-21 03:36:48'),
(52, 16, 'DELETE', 'Appointment', '15', 'Cancelled appointment', '::1', NULL, '2025-11-21 03:36:53'),
(53, 16, 'DELETE', 'Appointment', '14', 'Cancelled appointment', '::1', NULL, '2025-11-21 03:36:56'),
(54, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-21 04:36:32'),
(55, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-21 04:38:51'),
(56, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-21 04:42:42'),
(57, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-21 04:44:24'),
(58, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-21 04:53:08'),
(59, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-21 04:54:46'),
(60, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-21 12:00:00'),
(61, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-21 12:01:37'),
(62, 13, 'CREATE', 'HealthRecord', '7', 'Created examination', '::1', NULL, '2025-11-24 01:00:32'),
(63, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-24 01:09:22'),
(64, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-24 01:17:12'),
(65, 16, 'UPDATE', 'User', '16', 'Updated own profile', '::1', NULL, '2025-11-24 01:18:05'),
(66, 13, 'CREATE', 'Appointment', '21', 'Booked appointment for 2025-11-25', '::1', NULL, '2025-11-24 03:12:35'),
(67, 13, 'CREATE', 'Appointment', '22', 'Booked appointment for 2025-11-25', '::1', NULL, '2025-11-24 03:12:42'),
(68, 13, 'CREATE', 'HealthRecord', '8', 'Created examination', '::1', NULL, '2025-11-25 00:06:32'),
(69, 17, 'CREATE', 'HealthRecord', '9', 'Created examination', '::1', NULL, '2025-11-25 00:34:51'),
(85, 13, 'CREATE', 'Appointment', '28', 'Booked appointment for 2025-11-26', '::1', NULL, '2025-11-25 08:59:59'),
(86, 13, 'CREATE', 'Appointment', '29', 'Booked appointment for 2025-11-26', '::1', NULL, '2025-11-25 09:00:01'),
(87, 13, 'CREATE', 'Appointment', '30', 'Booked appointment for 2025-11-26', '::1', NULL, '2025-11-25 09:00:02'),
(88, 13, 'CREATE', 'Appointment', '31', 'Booked appointment for 2025-11-26', '::1', NULL, '2025-11-25 09:00:03'),
(89, 13, 'CREATE', 'Appointment', '32', 'Booked appointment for 2025-11-26', '::1', NULL, '2025-11-25 09:00:03'),
(90, 13, 'CREATE', 'Appointment', '33', 'Booked appointment for 2025-11-26', '::1', NULL, '2025-11-25 09:05:56'),
(91, 13, 'CREATE', 'Appointment', '34', 'Booked appointment for 2025-11-26', '::1', NULL, '2025-11-25 09:11:37'),
(92, 13, 'DELETE', 'Appointment', '34', 'Cancelled appointment', '::1', NULL, '2025-11-25 09:13:17'),
(93, 13, 'DELETE', 'Appointment', '33', 'Cancelled appointment', '::1', NULL, '2025-11-25 09:13:21'),
(94, 13, 'DELETE', 'Appointment', '28', 'Cancelled appointment', '::1', NULL, '2025-11-25 09:13:28'),
(95, 13, 'DELETE', 'Appointment', '30', 'Cancelled appointment', '::1', NULL, '2025-11-25 09:13:32'),
(96, 13, 'DELETE', 'Appointment', '29', 'Cancelled appointment', '::1', NULL, '2025-11-26 00:16:39'),
(97, 13, 'DELETE', 'Appointment', '31', 'Cancelled appointment', '::1', NULL, '2025-11-26 00:16:41'),
(98, 13, 'DELETE', 'Appointment', '32', 'Cancelled appointment', '::1', NULL, '2025-11-26 00:16:45'),
(99, 13, 'DELETE', 'Appointment', '21', 'Cancelled appointment', '::1', NULL, '2025-11-26 00:16:48'),
(100, 13, 'DELETE', 'Appointment', '22', 'Cancelled appointment', '::1', NULL, '2025-11-26 00:16:51'),
(101, 16, 'UPDATE', 'User', '16', 'Updated own profile', '::1', NULL, '2025-11-26 00:20:53'),
(102, 16, 'UPDATE', 'User', '16', 'Updated own profile', '::1', NULL, '2025-11-26 00:21:19'),
(103, 17, 'UPDATE', 'User', '17', 'Updated own profile', '::1', NULL, '2025-11-26 00:28:30'),
(104, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-26 00:37:41'),
(105, 16, 'UPDATE', 'User', '16', 'Updated own profile', '::1', NULL, '2025-11-26 01:06:33'),
(106, 14, 'UPDATE', 'Appointment', '13', 'Updated appointment', '::1', NULL, '2025-11-26 03:53:19'),
(107, 13, 'CREATE', 'Appointment', '35', 'Booked appointment for 2025-11-26', '::1', NULL, '2025-11-26 05:17:03'),
(108, 17, 'UPDATE', 'User', '17', 'Updated own profile', '::1', NULL, '2025-11-26 06:24:59'),
(109, 17, 'CREATE', 'Appointment', '36', 'Booked appointment for 2025-11-26', '::1', NULL, '2025-11-26 06:33:55'),
(110, 14, 'CREATE', 'HealthRecord', '19', 'Created examination', '::1', NULL, '2025-11-26 06:43:10'),
(111, 14, 'UPDATE', 'Appointment', '36', 'Updated appointment', '::1', NULL, '2025-11-27 00:04:40'),
(112, 14, 'UPDATE', 'User', '14', 'Updated own profile', '::1', NULL, '2025-11-27 00:17:51'),
(113, 14, 'UPDATE', 'User', '14', 'Updated own profile', '::1', NULL, '2025-11-27 00:23:00'),
(114, 14, 'UPDATE', 'User', '14', 'Updated own profile', '::1', NULL, '2025-11-27 00:24:26'),
(115, 14, 'PASSWORD_CHANGE', 'User', '14', 'Changed own password', '::1', NULL, '2025-11-27 00:49:35'),
(116, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-27 00:52:29'),
(117, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-11-27 00:57:38'),
(118, 13, 'CREATE', 'Appointment', '37', 'Booked appointment for 2025-11-27', '::1', NULL, '2025-11-27 04:09:08'),
(119, 14, 'UPDATE', 'Appointment', '37', 'Updated appointment', '::1', NULL, '2025-11-27 04:11:12'),
(120, 14, 'UPDATE', 'Appointment', '37', 'Updated appointment', '::1', NULL, '2025-11-27 04:12:48'),
(121, 14, 'UPDATE', 'Appointment', '37', 'Updated appointment', '::1', NULL, '2025-11-27 04:15:47'),
(122, 14, 'UPDATE', 'Appointment', '37', 'Updated appointment', '::1', NULL, '2025-11-27 04:25:02'),
(123, 14, 'UPDATE', 'Appointment', '37', 'Updated appointment', '::1', NULL, '2025-11-27 04:26:22'),
(124, 14, 'UPDATE', 'Appointment', '37', 'Updated appointment', '::1', NULL, '2025-11-27 04:30:12'),
(126, 14, 'CREATE', 'HealthRecord', '20', 'Created logbook visit', '::1', NULL, '2025-11-27 08:30:28'),
(127, 29, 'UPDATE', 'User', '29', 'Updated own profile', '::1', NULL, '2025-11-28 03:40:56'),
(128, 29, 'CREATE', 'Appointment', '39', 'Booked appointment for 2025-11-28', '::1', NULL, '2025-11-28 03:41:15'),
(129, 14, 'UPDATE', 'Appointment', '39', 'Updated appointment', '::1', NULL, '2025-11-30 07:20:09'),
(130, 14, 'CREATE', 'User', '30', 'Admin created user (student)', '::1', NULL, '2025-11-30 08:20:21'),
(132, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-11-30 08:57:11'),
(133, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-11-30 09:03:29'),
(134, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-11-30 09:03:44'),
(135, 14, 'UPDATE', 'Appointment', '39', 'Updated appointment', '::1', NULL, '2025-11-30 09:04:02'),
(136, 14, 'UPDATE', 'Appointment', '38', 'Updated appointment', '::1', NULL, '2025-11-30 09:09:59'),
(137, 14, 'UPDATE', 'Appointment', '35', 'Updated appointment', '::1', NULL, '2025-11-30 09:10:12'),
(138, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-11-30 09:11:28'),
(139, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-11-30 09:16:43'),
(140, 14, 'UPDATE', 'Appointment', '12', 'Updated appointment', '::1', NULL, '2025-11-30 09:16:51'),
(141, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-11-30 15:19:52'),
(142, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-11-30 15:20:24'),
(143, 14, 'UPDATE', 'Appointment', '39', 'Updated appointment', '::1', NULL, '2025-12-01 09:20:18'),
(144, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-12-02 16:02:04'),
(145, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-12-02 16:02:21'),
(146, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-12-02 16:02:32'),
(147, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-12-02 16:03:00'),
(148, 14, 'UPDATE', 'Appointment', '40', 'Updated appointment', '::1', NULL, '2025-12-02 16:03:55'),
(149, 14, 'UPDATE', 'Appointment', '39', 'Updated appointment', '::1', NULL, '2025-12-02 16:04:01'),
(150, 17, 'CREATE', 'Appointment', '41', 'Booked appointment for 2025-12-03', '::1', NULL, '2025-12-02 17:22:17'),
(151, 14, 'UPDATE', 'Appointment', '41', 'Updated appointment', '::1', NULL, '2025-12-02 17:37:08'),
(152, 14, 'UPDATE', 'User', '14', 'Updated own profile', '::1', NULL, '2025-12-02 17:40:15'),
(153, 14, 'UPDATE', 'User', '14', 'Updated own profile', '::1', NULL, '2025-12-02 17:41:57'),
(154, 14, 'UPDATE', 'User', '14', 'Updated own profile', '::1', NULL, '2025-12-02 17:50:32'),
(155, 14, 'UPDATE', 'Appointment', '41', 'Updated appointment', '::1', NULL, '2025-12-02 17:53:43'),
(156, 29, 'CREATE', 'Appointment', '42', 'Booked appointment for 2025-12-03', '::1', NULL, '2025-12-03 03:46:53'),
(157, 14, 'UPDATE', 'Appointment', '41', 'Updated appointment', '::1', NULL, '2025-12-03 03:53:58'),
(158, 14, 'UPDATE', 'Appointment', '42', 'Updated appointment', '::1', NULL, '2025-12-03 03:54:15'),
(159, 14, 'UPDATE', 'Appointment', '41', 'Updated appointment', '::1', NULL, '2025-12-03 03:59:40'),
(160, 14, 'UPDATE', 'Appointment', '41', 'Updated appointment', '::1', NULL, '2025-12-03 04:06:11'),
(161, 14, 'DELETE', 'Appointment', '41', 'Cancelled appointment', '::1', NULL, '2025-12-03 10:13:15'),
(162, 14, 'DELETE', 'Appointment', '42', 'Cancelled appointment', '::1', NULL, '2025-12-03 10:13:20'),
(163, 14, 'DELETE', 'Appointment', '40', 'Cancelled appointment', '::1', NULL, '2025-12-03 10:13:25'),
(164, 14, 'DELETE', 'Appointment', '39', 'Cancelled appointment', '::1', NULL, '2025-12-03 10:13:29'),
(165, 14, 'DELETE', 'Appointment', '38', 'Cancelled appointment', '::1', NULL, '2025-12-03 10:13:43'),
(166, 14, 'DELETE', 'Appointment', '37', 'Cancelled appointment', '::1', NULL, '2025-12-03 10:13:48'),
(167, 13, 'CREATE', 'Appointment', '43', 'Booked appointment for 2025-12-03', '::1', NULL, '2025-12-03 10:15:50'),
(168, 14, 'UPDATE', 'Appointment', '43', 'Updated appointment', '::1', NULL, '2025-12-03 10:16:39'),
(169, 13, 'CREATE', 'Appointment', '44', 'Booked appointment for 2025-12-04', '::1', NULL, '2025-12-03 10:25:49'),
(170, 14, 'UPDATE', 'Appointment', '44', 'Updated appointment', '::1', NULL, '2025-12-03 10:26:50'),
(171, 14, 'DELETE', 'HealthRecord', '8', 'Deleted health record', '::1', NULL, '2025-12-03 22:42:38'),
(172, 14, 'DELETE', 'HealthRecord', '7', 'Deleted health record', '::1', NULL, '2025-12-03 22:42:42'),
(173, 14, 'DELETE', 'HealthRecord', '19', 'Deleted health record', '::1', NULL, '2025-12-03 22:42:46'),
(174, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-12-04 05:35:34'),
(175, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-12-04 05:37:08'),
(176, 29, 'UPDATE', 'User', '29', 'Updated own profile', '::1', NULL, '2025-12-04 05:45:51'),
(177, 16, 'UPDATE', 'User', '16', 'Updated own profile', '::1', NULL, '2025-12-04 05:50:05'),
(178, 16, 'UPDATE', 'User', '16', 'Updated own profile', '::1', NULL, '2025-12-04 05:51:03'),
(179, 16, 'CREATE', 'Appointment', '45', 'Booked appointment for 2025-12-04', '::1', NULL, '2025-12-04 06:04:19'),
(180, 14, 'UPDATE', 'Appointment', '45', 'Updated appointment', '::1', NULL, '2025-12-04 06:05:27'),
(181, 14, 'UPDATE', 'Appointment', '45', 'Updated appointment', '::1', NULL, '2025-12-04 06:05:56'),
(182, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-12-04 06:28:01'),
(183, 14, 'DELETE', 'HealthRecord', '9', 'Deleted health record', '::1', NULL, '2025-12-04 08:52:01'),
(184, 14, 'DELETE', 'HealthRecord', '6', 'Deleted health record', '::1', NULL, '2025-12-04 08:52:04'),
(185, 16, 'CREATE', 'Appointment', '46', 'Booked appointment for 2025-12-04', '::1', NULL, '2025-12-04 08:52:48'),
(186, 14, 'CREATE', 'HealthRecord', '21', 'Created examination', '::1', NULL, '2025-12-04 09:35:59'),
(187, 14, 'CREATE', 'HealthRecord', '22', 'Created examination', '::1', NULL, '2025-12-04 15:39:19'),
(188, 14, 'DEACTIVATE', 'User', '30', 'Deactivated user 30', '::1', NULL, '2025-12-04 17:47:18'),
(189, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 18:00:24'),
(190, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 18:01:29'),
(191, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 18:02:00'),
(192, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 18:02:10'),
(193, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 18:02:17'),
(194, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 18:02:24'),
(195, 14, 'CREATE', 'HealthRecord', '23', 'Created examination', '::1', NULL, '2025-12-04 18:13:50'),
(196, 14, 'CREATE', 'HealthRecord', '24', 'Created examination', '::1', NULL, '2025-12-04 18:25:31'),
(197, 14, 'CREATE', 'HealthRecord', '25', 'Created examination', '::1', NULL, '2025-12-04 18:31:55'),
(198, 14, 'DELETE', 'HealthRecord', '21', 'Deleted health record', '::1', NULL, '2025-12-04 18:32:15'),
(199, 14, 'DELETE', 'HealthRecord', '25', 'Deleted health record', '::1', NULL, '2025-12-04 18:32:42'),
(200, 14, 'CREATE', 'HealthRecord', '26', 'Created examination', '::1', NULL, '2025-12-04 18:33:06'),
(201, 14, 'ACTIVATE', 'User', '30', 'Activated user 30', '::1', NULL, '2025-12-04 19:00:04'),
(202, 14, 'DEACTIVATE', 'User', '30', 'Deactivated user 30', '::1', NULL, '2025-12-04 19:00:09'),
(203, 14, 'ACTIVATE', 'User', '30', 'Activated user 30', '::1', NULL, '2025-12-04 19:00:12'),
(204, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 19:01:03'),
(205, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 19:03:25'),
(206, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 19:03:33'),
(207, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 19:03:39'),
(208, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 19:03:47'),
(209, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 19:04:02'),
(210, 14, 'UPDATE', 'Appointment', '45', 'Updated appointment', '::1', NULL, '2025-12-04 19:04:07'),
(211, 14, 'UPDATE', 'Appointment', '46', 'Updated appointment', '::1', NULL, '2025-12-04 20:53:33'),
(212, 14, 'UPDATE', 'User', '29', 'Updated user 29', '::1', NULL, '2025-12-04 20:56:18'),
(213, 14, 'UPDATE', 'User', '16', 'Updated user 16', '::1', NULL, '2025-12-04 20:56:37'),
(214, 14, 'UPDATE', 'User', '30', 'Updated user 30', '::1', NULL, '2025-12-04 21:00:41'),
(215, 14, 'UPDATE', 'User', '30', 'Updated user 30', '::1', NULL, '2025-12-04 21:00:50'),
(216, 14, 'UPDATE', 'User', '30', 'Updated user 30', '::1', NULL, '2025-12-04 21:01:39'),
(218, 14, 'UPDATE', 'User', '30', 'Updated user 30', '::1', NULL, '2025-12-04 21:10:59'),
(219, 14, 'UPDATE', 'User', '30', 'Updated user 30', '::1', NULL, '2025-12-04 21:18:48'),
(220, 14, 'UPDATE', 'User', '30', 'Updated user 30', '::1', NULL, '2025-12-04 21:25:01'),
(221, 14, 'UPDATE', 'User', '13', 'Updated user 13', '::1', NULL, '2025-12-04 21:25:36'),
(222, 14, 'UPDATE', 'User', '30', 'Updated user 30', '::1', NULL, '2025-12-04 21:31:30'),
(223, 14, 'UPDATE', 'User', '13', 'Updated user 13', '::1', NULL, '2025-12-04 21:31:36'),
(224, 13, 'UPDATE', 'User', '13', 'Updated own profile', '::1', NULL, '2025-12-04 21:32:33'),
(225, 14, 'UPDATE', 'User', '30', 'Updated user 30', '::1', NULL, '2025-12-04 21:41:42'),
(226, 14, 'UPDATE', 'User', '13', 'Updated user 13', '::1', NULL, '2025-12-04 21:45:01'),
(227, 14, 'UPDATE', 'User', '29', 'Updated user 29', '::1', NULL, '2025-12-04 22:05:14'),
(228, 14, 'UPDATE', 'User', '28', 'Updated user 28', '::1', NULL, '2025-12-04 22:05:32'),
(229, 14, 'UPDATE', 'User', '30', 'Updated user 30', '::1', NULL, '2025-12-04 22:06:11'),
(230, 14, 'DELETE', 'User', '30', 'Deleted user 30', '::1', NULL, '2025-12-04 22:10:31'),
(231, 14, 'DELETE', 'User', '28', 'Deleted user 28', '::1', NULL, '2025-12-04 22:10:35'),
(232, 14, 'UPDATE', 'Appointment', '45', 'Updated appointment', '::1', NULL, '2025-12-04 22:13:50'),
(233, 14, 'DELETE', 'Appointment', '46', 'Cancelled appointment', '::1', NULL, '2025-12-04 22:13:59'),
(234, 14, 'UPDATE', 'User', '13', 'Updated user 13', '::1', NULL, '2025-12-04 22:17:38'),
(235, 14, 'CREATE', 'User', '31', 'Admin created user (student)', '::1', NULL, '2025-12-04 22:19:14'),
(237, 14, 'DELETE', 'User', '31', 'Deleted user 31', '::1', NULL, '2025-12-04 23:52:14'),
(238, 14, 'CREATE', 'User', '32', 'Admin created user (student)', '::1', NULL, '2025-12-04 23:53:29'),
(239, 32, 'UPDATE', 'User', '32', 'Updated own profile', '::1', NULL, '2025-12-04 23:55:06'),
(240, 32, 'CREATE', 'Appointment', '48', 'Booked appointment for 2025-12-05', '::1', NULL, '2025-12-04 23:55:38'),
(241, 14, 'CREATE', 'HealthRecord', '27', 'Created examination', '::1', NULL, '2025-12-04 23:56:56'),
(242, 14, 'CREATE', 'HealthRecord', '28', 'Created logbook visit', '::1', NULL, '2025-12-04 23:59:35'),
(243, 14, 'UPDATE', 'Appointment', '48', 'Updated appointment', '::1', NULL, '2025-12-04 23:59:49'),
(244, 14, 'DEACTIVATE', 'User', '32', 'Deactivated user 32', '::1', NULL, '2025-12-05 00:29:52'),
(245, 14, 'ACTIVATE', 'User', '32', 'Activated user 32', '::1', NULL, '2025-12-05 00:30:39'),
(246, 14, 'UPDATE', 'User', '32', 'Updated user 32', '::1', NULL, '2025-12-05 02:11:27'),
(247, 14, 'CREATE', 'HealthRecord', '29', 'Created examination', '::1', NULL, '2025-12-05 04:15:44'),
(248, 14, 'CREATE', 'HealthRecord', '30', 'Created logbook visit', '::1', NULL, '2025-12-05 04:17:25');

-- --------------------------------------------------------

--
-- Table structure for table `health_records`
--

CREATE TABLE `health_records` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `record_type` varchar(50) NOT NULL,
  `date_of_visit` date NOT NULL,
  `medical_staff_id` int(10) UNSIGNED DEFAULT NULL,
  `chief_complaint` varchar(255) DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `treatment` text DEFAULT NULL,
  `vital_blood_pressure` varchar(20) DEFAULT NULL,
  `vital_heart_rate` int(11) DEFAULT NULL,
  `vital_respiratory_rate` int(11) DEFAULT NULL,
  `vital_temperature` decimal(4,1) DEFAULT NULL,
  `vital_weight` decimal(5,2) DEFAULT NULL,
  `vital_height` decimal(5,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `health_records`
--

INSERT INTO `health_records` (`id`, `student_id`, `record_type`, `date_of_visit`, `medical_staff_id`, `chief_complaint`, `diagnosis`, `treatment`, `vital_blood_pressure`, `vital_heart_rate`, `vital_respiratory_rate`, `vital_temperature`, `vital_weight`, `vital_height`, `notes`, `attachments`, `created_at`, `updated_at`) VALUES
(5, 13, 'examination', '2025-11-21', NULL, 'Physical/Medical Examination', 'None', 'Follow Up', '120/80', 50, NULL, 34.0, 50.00, 130.00, '{\"physical\":{\"height\":130,\"weight\":50,\"bloodPressure\":\"120/80\",\"heartRate\":\"50\",\"temperature\":\"34\"},\"medical\":{\"findings\":\"None\",\"recommendation\":\"Follow Up\"}}', NULL, '2025-11-21 02:33:47', '2025-11-21 02:33:47'),
(20, 13, 'visit', '2025-11-27', 14, 'Consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"time\":\"16:29\",\"role\":\"student\",\"name\":\"Angela Tanya G. Navarrosa\",\"recorded_by\":14}', NULL, '2025-11-27 08:30:28', '2025-11-27 08:30:28'),
(22, 29, 'examination', '2025-12-04', 14, 'Physical/Medical Examination', NULL, NULL, '120/80', 60, 50, 30.0, 40.00, 140.00, '{\"physical\":{\"height\":140,\"weight\":40,\"bloodPressure\":\"120/80\",\"heartRate\":60,\"respiratoryRate\":50,\"temperature\":30},\"medical\":{\"findings\":\"\",\"recommendation\":\"\"}}', NULL, '2025-12-04 15:39:19', '2025-12-04 15:39:19'),
(23, 29, 'examination', '2025-12-04', 14, 'Physical/Medical Examination', 'sasas', 'asasa', '120/80', 49, 52, 31.0, 70.00, 165.00, '{\"physical\":{\"height\":165,\"weight\":70,\"bloodPressure\":\"120/80\",\"heartRate\":49,\"respiratoryRate\":52,\"temperature\":31},\"medical\":{\"findings\":\"sasas\",\"recommendation\":\"asasa\"}}', NULL, '2025-12-04 18:13:50', '2025-12-04 18:13:50'),
(24, 16, 'examination', '2025-12-04', 14, 'Physical/Medical Examination', NULL, NULL, '120/80', 19, 323, 30.0, 70.00, 165.00, '{\"physical\":{\"height\":165,\"weight\":70,\"bloodPressure\":\"120/80\",\"heartRate\":19,\"respiratoryRate\":323,\"temperature\":30},\"medical\":{\"findings\":\"\",\"recommendation\":\"\"}}', NULL, '2025-12-04 18:25:31', '2025-12-04 18:25:31'),
(26, 17, 'examination', '2025-12-04', 14, 'Physical/Medical Examination', NULL, NULL, '2121', 21, 21, 31.0, 212.00, 212.00, '{\"physical\":{\"height\":212,\"weight\":212,\"bloodPressure\":\"2121\",\"heartRate\":21,\"respiratoryRate\":21,\"temperature\":31},\"medical\":{\"findings\":\"\",\"recommendation\":\"\"}}', NULL, '2025-12-04 18:33:06', '2025-12-04 18:33:06'),
(27, 32, 'examination', '2025-12-04', 14, 'Physical/Medical Examination', 'none', 'goods', '120/80', 60, 60, 34.0, 60.00, 160.00, '{\"physical\":{\"height\":160,\"weight\":60,\"bloodPressure\":\"120/80\",\"heartRate\":60,\"respiratoryRate\":60,\"temperature\":34},\"medical\":{\"findings\":\"none\",\"recommendation\":\"goods\"}}', NULL, '2025-12-04 23:56:56', '2025-12-04 23:56:56'),
(28, 32, 'visit', '2025-12-04', 14, 'Request', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"time\":\"07:59\",\"role\":\"student\",\"name\":\"Trixie\",\"recorded_by\":14}', NULL, '2025-12-04 23:59:35', '2025-12-04 23:59:35'),
(29, 32, 'examination', '2025-12-05', 14, 'Physical/Medical Examination', 'none', NULL, '120/80', 50, 50, 30.0, 60.00, 160.00, '{\"physical\":{\"height\":160,\"weight\":60,\"bloodPressure\":\"120/80\",\"heartRate\":50,\"respiratoryRate\":50,\"temperature\":30},\"medical\":{\"findings\":\"none\",\"recommendation\":\"\"}}', NULL, '2025-12-05 04:15:44', '2025-12-05 04:15:44'),
(30, 13, 'visit', '2025-12-05', 14, 'Consultation', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '{\"time\":\"12:17\",\"role\":\"student\",\"name\":\"Angela Tanya G. Navarrosa\",\"recorded_by\":14}', NULL, '2025-12-05 04:17:25', '2025-12-05 04:17:25');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `recipient_id` int(10) UNSIGNED NOT NULL,
  `sender_id` int(10) UNSIGNED NOT NULL,
  `type` enum('appointment_reminder','health_record_update','system_alert','message') NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `related_record_id` int(10) UNSIGNED DEFAULT NULL,
  `related_appointment_id` int(10) UNSIGNED DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `message`, `related_record_id`, `related_appointment_id`, `is_read`, `priority`, `created_at`, `updated_at`) VALUES
(23, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Follow Up on 2025-11-18 at 10:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-17 14:15:20', '2025-11-21 03:25:36'),
(24, 13, 13, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', 5, NULL, 1, 'medium', '2025-11-21 02:33:47', '2025-11-21 03:25:34'),
(25, 16, 16, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', NULL, NULL, 1, 'medium', '2025-11-21 03:33:13', '2025-11-26 00:21:06'),
(26, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Employment on 2025-11-24 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-21 03:36:18', '2025-11-26 00:21:06'),
(27, 14, 16, 'appointment_reminder', 'New Appointment Request — Pre-Employment', 'New appointment request from Non-Academic Staff Rommel  Tomas. Purpose: Pre-Employment | Date: 2025-11-24 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-21 03:36:18', '2025-12-04 05:02:54'),
(28, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Employment on 2025-11-24 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-21 03:36:22', '2025-11-26 00:21:06'),
(29, 14, 16, 'appointment_reminder', 'New Appointment Request — Pre-Employment', 'New appointment request from Non-Academic Staff Rommel  Tomas. Purpose: Pre-Employment | Date: 2025-11-24 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-21 03:36:22', '2025-12-04 05:02:54'),
(30, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Employment on 2025-11-24 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-21 03:36:23', '2025-11-26 00:21:06'),
(31, 14, 16, 'appointment_reminder', 'New Appointment Request — Pre-Employment', 'New appointment request from Non-Academic Staff Rommel  Tomas. Purpose: Pre-Employment | Date: 2025-11-24 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-21 03:36:23', '2025-12-04 05:02:54'),
(32, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Employment on 2025-11-24 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-21 03:36:24', '2025-11-26 00:21:06'),
(33, 14, 16, 'appointment_reminder', 'New Appointment Request — Pre-Employment', 'New appointment request from Non-Academic Staff Rommel  Tomas. Purpose: Pre-Employment | Date: 2025-11-24 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-21 03:36:24', '2025-12-04 05:02:54'),
(34, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Employment on 2025-11-24 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-21 03:36:24', '2025-11-26 00:21:06'),
(35, 14, 16, 'appointment_reminder', 'New Appointment Request — Pre-Employment', 'New appointment request from Non-Academic Staff Rommel  Tomas. Purpose: Pre-Employment | Date: 2025-11-24 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-21 03:36:24', '2025-12-04 05:02:54'),
(36, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Employment on 2025-11-24 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-21 03:36:24', '2025-11-26 00:21:06'),
(37, 14, 16, 'appointment_reminder', 'New Appointment Request — Pre-Employment', 'New appointment request from Non-Academic Staff Rommel  Tomas. Purpose: Pre-Employment | Date: 2025-11-24 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-21 03:36:24', '2025-12-04 05:02:54'),
(38, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Employment on 2025-11-24 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-21 03:36:26', '2025-11-26 00:21:06'),
(39, 14, 16, 'appointment_reminder', 'New Appointment Request — Pre-Employment', 'New appointment request from Non-Academic Staff Rommel  Tomas. Purpose: Pre-Employment | Date: 2025-11-24 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-21 03:36:26', '2025-12-04 05:02:54'),
(40, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Employment on 2025-11-24 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-21 03:36:29', '2025-11-26 00:21:06'),
(41, 14, 16, 'appointment_reminder', 'New Appointment Request — Pre-Employment', 'New appointment request from Non-Academic Staff Rommel  Tomas. Purpose: Pre-Employment | Date: 2025-11-24 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-21 03:36:29', '2025-12-04 05:02:54'),
(49, 13, 13, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', NULL, NULL, 1, 'medium', '2025-11-24 01:00:32', '2025-11-25 08:52:17'),
(50, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Enrollment on 2025-11-25 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-24 03:12:35', '2025-11-25 08:52:17'),
(51, 14, 13, 'appointment_reminder', 'New Appointment Request — Pre-Enrollment', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Pre-Enrollment | Date: 2025-11-25 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-24 03:12:35', '2025-12-04 05:02:54'),
(52, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Enrollment on 2025-11-25 at 14:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-24 03:12:42', '2025-11-25 08:52:14'),
(53, 14, 13, 'appointment_reminder', 'New Appointment Request — Pre-Enrollment', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Pre-Enrollment | Date: 2025-11-25 | Time: 14:00', NULL, NULL, 1, 'medium', '2025-11-24 03:12:42', '2025-12-04 05:02:54'),
(54, 13, 13, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', NULL, NULL, 1, 'medium', '2025-11-25 00:06:32', '2025-11-25 08:52:10'),
(55, 17, 17, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', NULL, NULL, 1, 'medium', '2025-11-25 00:34:51', '2025-12-02 17:15:11'),
(75, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Consultation on 2025-11-26 at 09:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-25 08:59:59', '2025-11-26 04:25:02'),
(76, 14, 13, 'appointment_reminder', 'New Appointment Request — Consultation', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Consultation | Date: 2025-11-26 | Time: 09:00', NULL, NULL, 1, 'medium', '2025-11-25 08:59:59', '2025-12-04 05:02:54'),
(77, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Consultation on 2025-11-26 at 09:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-25 09:00:01', '2025-11-26 04:25:02'),
(78, 14, 13, 'appointment_reminder', 'New Appointment Request — Consultation', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Consultation | Date: 2025-11-26 | Time: 09:00', NULL, NULL, 1, 'medium', '2025-11-25 09:00:01', '2025-12-04 05:02:54'),
(79, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Consultation on 2025-11-26 at 09:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-25 09:00:02', '2025-11-26 04:25:02'),
(80, 14, 13, 'appointment_reminder', 'New Appointment Request — Consultation', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Consultation | Date: 2025-11-26 | Time: 09:00', NULL, NULL, 1, 'medium', '2025-11-25 09:00:02', '2025-12-04 05:02:54'),
(81, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Consultation on 2025-11-26 at 09:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-25 09:00:03', '2025-11-26 04:25:02'),
(82, 14, 13, 'appointment_reminder', 'New Appointment Request — Consultation', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Consultation | Date: 2025-11-26 | Time: 09:00', NULL, NULL, 1, 'medium', '2025-11-25 09:00:03', '2025-12-04 05:02:54'),
(83, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Consultation on 2025-11-26 at 09:00 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-25 09:00:03', '2025-11-26 04:25:02'),
(84, 14, 13, 'appointment_reminder', 'New Appointment Request — Consultation', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Consultation | Date: 2025-11-26 | Time: 09:00', NULL, NULL, 1, 'medium', '2025-11-25 09:00:03', '2025-12-04 05:02:54'),
(85, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Consultation on 2025-11-26 at 09:05 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-25 09:05:56', '2025-11-26 04:25:02'),
(86, 14, 13, 'appointment_reminder', 'New Appointment Request — Consultation', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Consultation | Date: 2025-11-26 | Time: 09:05', NULL, NULL, 1, 'medium', '2025-11-25 09:05:56', '2025-12-04 05:02:54'),
(87, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Consultation on 2025-11-26 at 09:11 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-25 09:11:37', '2025-11-26 04:24:59'),
(88, 14, 13, 'appointment_reminder', 'New Appointment Request — Consultation', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Consultation | Date: 2025-11-26 | Time: 09:11', NULL, NULL, 1, 'medium', '2025-11-25 09:11:37', '2025-12-04 05:02:54'),
(98, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-26 03:53:19', '2025-11-27 07:31:04'),
(99, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for MedCert for OJT Students on 2025-11-26 at 13:16 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-26 05:17:03', '2025-12-02 17:14:14'),
(100, 14, 13, 'appointment_reminder', 'New Appointment Request — MedCert for OJT Students', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: MedCert for OJT Students | Date: 2025-11-26 | Time: 13:16', NULL, NULL, 1, 'medium', '2025-11-26 05:17:03', '2025-12-04 05:02:54'),
(101, 17, 17, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Medical Certificate Request on 2025-11-26 at 14:33 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-26 06:33:55', '2025-12-02 17:15:11'),
(102, 14, 17, 'appointment_reminder', 'New Appointment Request — Medical Certificate Request', 'New appointment request from Faculty Josephine  Tacud Torno. Purpose: Medical Certificate Request | Date: 2025-11-26 | Time: 14:33', NULL, NULL, 1, 'medium', '2025-11-26 06:33:55', '2025-12-04 05:02:54'),
(103, 17, 14, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', NULL, NULL, 1, 'medium', '2025-11-26 06:43:10', '2025-12-02 17:15:11'),
(104, 17, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-27 00:04:40', '2025-12-02 17:15:11'),
(105, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Consultation on 2025-11-27 at 12:09 has been scheduled successfully.', NULL, NULL, 1, 'medium', '2025-11-27 04:09:08', '2025-12-02 17:14:14'),
(106, 14, 13, 'appointment_reminder', 'New Appointment Request — Consultation', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Consultation | Date: 2025-11-27 | Time: 12:09', NULL, NULL, 1, 'medium', '2025-11-27 04:09:08', '2025-12-04 05:02:54'),
(107, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-27 04:11:12', '2025-12-02 17:14:14'),
(108, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-27 04:12:48', '2025-12-02 17:14:14'),
(109, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-27 04:15:47', '2025-12-02 17:14:14'),
(110, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-27 04:25:02', '2025-12-02 17:14:14'),
(111, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-27 04:26:22', '2025-12-02 17:14:14'),
(112, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-27 04:30:12', '2025-12-02 17:14:14'),
(115, 29, 29, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Follow Up on 2025-11-28 at 11:41 has been scheduled successfully.', NULL, NULL, 0, 'medium', '2025-11-28 03:41:15', '2025-11-28 03:41:15'),
(116, 14, 29, 'appointment_reminder', 'New Appointment Request — Follow Up', 'New appointment request from Faculty Christian Bagaipo Mamawag. Purpose: Follow Up | Date: 2025-11-28 | Time: 11:41', NULL, NULL, 1, 'medium', '2025-11-28 03:41:15', '2025-11-30 07:21:14'),
(117, 29, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-11-30 07:20:09', '2025-11-30 07:20:09'),
(123, 29, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-11-30 09:04:02', '2025-11-30 09:04:02'),
(125, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-30 09:10:12', '2025-12-02 17:14:14'),
(129, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 1, 'medium', '2025-11-30 09:16:51', '2025-12-02 17:14:14'),
(130, 13, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, NULL, 1, 'medium', '2025-11-30 09:16:52', '2025-12-02 17:14:14'),
(135, 29, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-01 09:20:18', '2025-12-01 09:20:18'),
(136, 29, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to done', NULL, NULL, 0, 'medium', '2025-12-01 09:20:19', '2025-12-01 09:20:19'),
(147, 29, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-02 16:04:01', '2025-12-02 16:04:01'),
(148, 29, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, NULL, 0, 'medium', '2025-12-02 16:04:02', '2025-12-02 16:04:02'),
(149, 17, 17, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Follow Up on 2025-12-03 at 13:22 has been scheduled successfully.', NULL, NULL, 0, 'medium', '2025-12-02 17:22:17', '2025-12-02 17:22:17'),
(150, 14, 17, 'appointment_reminder', 'New Appointment Request — Follow Up', 'New appointment request from Faculty Josephine  Tacud Torno. Purpose: Follow Up | Date: 2025-12-03 | Time: 13:22', NULL, NULL, 1, 'medium', '2025-12-02 17:22:17', '2025-12-03 14:13:28'),
(151, 17, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-02 17:37:08', '2025-12-02 17:37:08'),
(152, 17, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to in_progress', NULL, NULL, 0, 'medium', '2025-12-02 17:37:09', '2025-12-02 17:37:09'),
(153, 17, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-02 17:53:43', '2025-12-02 17:53:43'),
(154, 17, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to scheduled', NULL, NULL, 0, 'medium', '2025-12-02 17:53:44', '2025-12-02 17:53:44'),
(155, 29, 29, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Follow Up on 2025-12-03 at 11:46 has been scheduled successfully.', NULL, NULL, 0, 'medium', '2025-12-03 03:46:53', '2025-12-03 03:46:53'),
(156, 14, 29, 'appointment_reminder', 'New Appointment Request — Follow Up', 'New appointment request from Faculty Christian Bagaipo Mamawag. Purpose: Follow Up | Date: 2025-12-03 | Time: 11:46', NULL, NULL, 1, 'medium', '2025-12-03 03:46:53', '2025-12-03 14:13:29'),
(157, 17, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-03 03:53:58', '2025-12-03 03:53:58'),
(158, 17, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, NULL, 0, 'medium', '2025-12-03 03:53:58', '2025-12-03 03:53:58'),
(159, 29, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-03 03:54:15', '2025-12-03 03:54:15'),
(160, 29, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, NULL, 0, 'medium', '2025-12-03 03:54:16', '2025-12-03 03:54:16'),
(161, 17, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-03 03:59:40', '2025-12-03 03:59:40'),
(162, 17, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to pending', NULL, NULL, 0, 'medium', '2025-12-03 03:59:40', '2025-12-03 03:59:40'),
(163, 17, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-03 04:06:11', '2025-12-03 04:06:11'),
(164, 17, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, NULL, 0, 'medium', '2025-12-03 04:06:12', '2025-12-03 04:06:12'),
(171, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Follow Up on 2025-12-03 at 16:15 has been scheduled successfully.', NULL, 43, 1, 'medium', '2025-12-03 10:15:50', '2025-12-04 05:35:55'),
(172, 14, 13, 'appointment_reminder', 'New Appointment Request — Follow Up', 'New appointment request from Student Angela Tanya Galera Navarrosa. Purpose: Follow Up | Date: 2025-12-03 | Time: 16:15', NULL, 43, 1, 'medium', '2025-12-03 10:15:50', '2025-12-03 14:13:31'),
(173, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, 43, 1, 'medium', '2025-12-03 10:16:39', '2025-12-04 05:35:55'),
(174, 13, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, 43, 1, 'medium', '2025-12-03 10:16:40', '2025-12-04 05:35:55'),
(175, 13, 13, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Enrollment on 2025-12-04 at 12:25 has been scheduled successfully.', NULL, 44, 1, 'medium', '2025-12-03 10:25:49', '2025-12-04 05:35:55'),
(177, 13, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, 44, 1, 'medium', '2025-12-03 10:26:50', '2025-12-04 05:35:55'),
(178, 13, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, 44, 1, 'medium', '2025-12-03 10:26:50', '2025-12-04 05:35:55'),
(179, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Consultation on 2025-12-04 at 14:04 has been scheduled successfully.', NULL, 45, 0, 'medium', '2025-12-04 06:04:19', '2025-12-04 06:04:19'),
(180, 14, 16, 'appointment_reminder', 'New Appointment Request — Consultation', 'New appointment request from Non-Academic Staff Rommel   Tomas. Purpose: Consultation | Date: 2025-12-04 | Time: 14:04', NULL, 45, 1, 'medium', '2025-12-04 06:04:19', '2025-12-04 22:41:58'),
(181, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, 45, 0, 'medium', '2025-12-04 06:05:27', '2025-12-04 06:05:27'),
(182, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to pending', NULL, 45, 0, 'medium', '2025-12-04 06:05:27', '2025-12-04 06:05:27'),
(183, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, 45, 0, 'medium', '2025-12-04 06:05:56', '2025-12-04 06:05:56'),
(184, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, 45, 0, 'medium', '2025-12-04 06:05:56', '2025-12-04 06:05:56'),
(185, 16, 16, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Follow Up on 2025-12-04 at 16:52 has been scheduled successfully.', NULL, NULL, 0, 'medium', '2025-12-04 08:52:48', '2025-12-04 08:52:48'),
(186, 14, 16, 'appointment_reminder', 'New Appointment Request — Follow Up', 'New appointment request from Non-Academic Staff Rommel   Tomas. Purpose: Follow Up | Date: 2025-12-04 | Time: 16:52', NULL, NULL, 1, 'medium', '2025-12-04 08:52:48', '2025-12-04 22:41:58'),
(188, 29, 14, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', 22, NULL, 0, 'medium', '2025-12-04 15:39:19', '2025-12-04 15:39:19'),
(189, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 18:00:24', '2025-12-04 18:00:24'),
(190, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, NULL, 0, 'medium', '2025-12-04 18:00:24', '2025-12-04 18:00:24'),
(191, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 18:01:29', '2025-12-04 18:01:29'),
(192, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to pending', NULL, NULL, 0, 'medium', '2025-12-04 18:01:29', '2025-12-04 18:01:29'),
(193, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 18:02:00', '2025-12-04 18:02:00'),
(194, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to scheduled', NULL, NULL, 0, 'medium', '2025-12-04 18:02:00', '2025-12-04 18:02:00'),
(195, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 18:02:10', '2025-12-04 18:02:10'),
(196, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to in_progress', NULL, NULL, 0, 'medium', '2025-12-04 18:02:10', '2025-12-04 18:02:10'),
(197, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 18:02:17', '2025-12-04 18:02:17'),
(198, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to cancelled', NULL, NULL, 0, 'medium', '2025-12-04 18:02:18', '2025-12-04 18:02:18'),
(199, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 18:02:24', '2025-12-04 18:02:24'),
(200, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to scheduled', NULL, NULL, 0, 'medium', '2025-12-04 18:02:24', '2025-12-04 18:02:24'),
(201, 29, 14, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', 23, NULL, 0, 'medium', '2025-12-04 18:13:50', '2025-12-04 18:13:50'),
(202, 16, 14, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', 24, NULL, 0, 'medium', '2025-12-04 18:25:31', '2025-12-04 18:25:31'),
(203, 17, 14, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', NULL, NULL, 0, 'medium', '2025-12-04 18:31:55', '2025-12-04 18:31:55'),
(204, 17, 14, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', 26, NULL, 0, 'medium', '2025-12-04 18:33:06', '2025-12-04 18:33:06'),
(205, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 19:01:03', '2025-12-04 19:01:03'),
(206, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to pending', NULL, NULL, 0, 'medium', '2025-12-04 19:01:04', '2025-12-04 19:01:04'),
(207, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 19:03:25', '2025-12-04 19:03:25'),
(208, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to scheduled', NULL, NULL, 0, 'medium', '2025-12-04 19:03:25', '2025-12-04 19:03:25'),
(209, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 19:03:33', '2025-12-04 19:03:33'),
(210, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, NULL, 0, 'medium', '2025-12-04 19:03:34', '2025-12-04 19:03:34'),
(211, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 19:03:39', '2025-12-04 19:03:39'),
(212, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to in_progress', NULL, NULL, 0, 'medium', '2025-12-04 19:03:40', '2025-12-04 19:03:40'),
(213, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 19:03:47', '2025-12-04 19:03:47'),
(214, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, NULL, 0, 'medium', '2025-12-04 19:03:47', '2025-12-04 19:03:47'),
(215, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 19:04:02', '2025-12-04 19:04:02'),
(216, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to scheduled', NULL, NULL, 0, 'medium', '2025-12-04 19:04:02', '2025-12-04 19:04:02'),
(217, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, 45, 0, 'medium', '2025-12-04 19:04:07', '2025-12-04 19:04:07'),
(218, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to scheduled', NULL, 45, 0, 'medium', '2025-12-04 19:04:07', '2025-12-04 19:04:07'),
(219, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, NULL, 0, 'medium', '2025-12-04 20:53:33', '2025-12-04 20:53:33'),
(220, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to pending', NULL, NULL, 0, 'medium', '2025-12-04 20:53:34', '2025-12-04 20:53:34'),
(221, 16, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, 45, 0, 'medium', '2025-12-04 22:13:50', '2025-12-04 22:13:50'),
(222, 16, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, 45, 0, 'medium', '2025-12-04 22:13:50', '2025-12-04 22:13:50'),
(226, 32, 32, 'appointment_reminder', 'Appointment Scheduled', 'Your appointment for Pre-Enrollment on 2025-12-05 at 10:55 has been scheduled successfully.', NULL, 48, 0, 'medium', '2025-12-04 23:55:38', '2025-12-04 23:55:38'),
(227, 14, 32, 'appointment_reminder', 'New Appointment Request — Pre-Enrollment', 'New appointment request from Student Trixie Galera Navarrosa. Purpose: Pre-Enrollment | Date: 2025-12-05 | Time: 10:55', NULL, 48, 0, 'medium', '2025-12-04 23:55:38', '2025-12-04 23:55:38'),
(228, 32, 14, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', 27, NULL, 0, 'medium', '2025-12-04 23:56:56', '2025-12-04 23:56:56'),
(229, 32, 14, 'appointment_reminder', 'Appointment Updated', 'Your appointment has been updated successfully.', NULL, 48, 0, 'medium', '2025-12-04 23:59:49', '2025-12-04 23:59:49'),
(230, 32, 14, '', 'Appointment Status Updated', 'Your appointment status has been updated to confirmed', NULL, 48, 0, 'medium', '2025-12-04 23:59:50', '2025-12-04 23:59:50'),
(231, 32, 14, 'health_record_update', 'Examination Recorded', 'Your physical and medical examination record has been successfully created.', 29, NULL, 0, 'medium', '2025-12-05 04:15:44', '2025-12-05 04:15:44');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `employee_id` varchar(20) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','faculty','admin','medical_staff','non_academic') NOT NULL DEFAULT 'student',
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `year_level` varchar(20) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `college` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `section` varchar(50) DEFAULT NULL,
  `student_type` enum('Regular','Irregular','Transferee') DEFAULT NULL,
  `guardian_name` varchar(100) DEFAULT NULL,
  `guardian_contact` varchar(20) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `years_of_service` int(11) DEFAULT NULL,
  `office_location` varchar(100) DEFAULT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `years_experience` int(11) DEFAULT NULL,
  `shift_schedule` varchar(100) DEFAULT NULL,
  `employment_type` enum('Permanent','Contractual','Part-time') DEFAULT NULL,
  `supervisor` varchar(100) DEFAULT NULL,
  `emergency_name` varchar(100) DEFAULT NULL,
  `emergency_phone` varchar(20) DEFAULT NULL,
  `emergency_address` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `student_id`, `employee_id`, `email`, `password_hash`, `role`, `first_name`, `middle_name`, `last_name`, `department`, `year_level`, `course`, `college`, `position`, `address`, `birthday`, `age`, `phone_number`, `section`, `student_type`, `guardian_name`, `guardian_contact`, `specialization`, `years_of_service`, `office_location`, `license_number`, `years_experience`, `shift_schedule`, `employment_type`, `supervisor`, `emergency_name`, `emergency_phone`, `emergency_address`, `is_active`, `created_at`, `updated_at`) VALUES
(13, '224-09159M', NULL, 'navarrosa.at.bsinfotech@gmail.com', '$2b$10$81ccO4HgpVPhJiLDWfYFi.I61l.dIyCctjvel0RyZi8CSjBzk8zjy', 'student', 'Angela Tanya', 'Galera', 'Navarrosa', NULL, '4', 'CCS', 'CCS', NULL, 'Navotas', '0000-00-00', 0, '09992431297', 'C', 'Regular', '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-17 14:14:44', '2025-12-04 22:17:38'),
(14, NULL, 'ADM-2025-001', 'marin.ff.bsinfotech@gmail.com', '$2b$10$CW3kjbgAGaMjdcMZadjF3eqDnl25IhmRy8tVPJItc3hA5MSIw7Wr6', 'admin', 'Febrich Faith', NULL, 'Marin', 'Clinic', NULL, NULL, NULL, 'Staff', 'Romblon', '2003-12-30', 21, '09992431251', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-17 14:17:01', '2025-12-02 17:50:32'),
(16, NULL, '224-09119N', 'tomas.r.bsinfotech@gmail.com', '$2b$10$N3Y2U4eG4gOGlnycv5zmIutb6qKm43sc19Ut5n7CuI6jX80VZr.z.', 'non_academic', 'Rommel ', NULL, 'Tomas', 'Registrar', NULL, NULL, NULL, 'Non-Academic ', 'Manila', '2016-06-08', 9, '09123438875', NULL, NULL, NULL, NULL, NULL, NULL, 'Main Gate - Registrar', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, 1, '2025-11-21 03:30:38', '2025-12-04 20:56:37'),
(17, NULL, 'PROF-2025-017', 'torno.j.bsinfotech@gmail.com', '$2b$10$LJxfKt3q/WOtz1Tt195fg.0um9UyJ0sugjYjh/UpxR3/qe8YF7Yli', 'faculty', 'Josephine ', 'Tacud', 'Torno', 'CCS', NULL, NULL, NULL, 'Professor', 'Antipolo ', '2002-04-14', 23, '09123438875', NULL, NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-25 00:33:20', '2025-12-04 05:32:48'),
(29, NULL, '224-08840F', 'mamawag.c.bsinfotech@gmail.com', '$2b$10$4EybuuRlDRQ7tI7CQkvHzegyGEzBwKLIn4Yai7sa3f01gPUnerp9.', 'faculty', 'Christian', 'Bagaipo', 'Mamawag', 'CCS', NULL, NULL, NULL, 'Professor', 'Rizal', '2023-01-31', 2, '09123438875', NULL, NULL, NULL, NULL, NULL, NULL, 'MIS building', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-11-28 03:40:30', '2025-12-04 22:05:14'),
(32, 'STU-2025-001', NULL, 'tanyanavarrosa.11@gmail.com', '$2b$10$CUUYGBhEDkxx0Zga8MZp2euVkhBI9hqd1S1zQi1Fmq1xEM1L.WG2K', 'student', 'Trixie', 'Galera', 'Navarrosa', NULL, '1', 'CHTM', 'CHTM', NULL, '', '2003-11-05', 22, '09123438875', 'A', 'Regular', 'Arnold Navarrosa', '09876543211', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-12-04 23:53:29', '2025-12-05 02:11:26');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_appointment_date` (`appointment_date`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_actor_id` (`actor_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `health_records`
--
ALTER TABLE `health_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_date_of_visit` (`date_of_visit`),
  ADD KEY `idx_medical_staff_id` (`medical_staff_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipient_id` (`recipient_id`),
  ADD KEY `idx_sender_id` (`sender_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `notifications_ibfk_3` (`related_record_id`),
  ADD KEY `notifications_ibfk_4` (`related_appointment_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_dept` (`department`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=249;

--
-- AUTO_INCREMENT for table `health_records`
--
ALTER TABLE `health_records`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=232;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `health_records`
--
ALTER TABLE `health_records`
  ADD CONSTRAINT `health_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `health_records_ibfk_2` FOREIGN KEY (`medical_staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`related_record_id`) REFERENCES `health_records` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`related_appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
