-- --------------------------------------------------------
-- Host:                         66.51.132.100
-- Server version:               5.7.16-0ubuntu0.16.04.1 - (Ubuntu)
-- Server OS:                    Linux
-- HeidiSQL Version:             9.3.0.4984
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
-- Dumping data for table ccio.Users: ~0 rows (approximately)
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` (`ke`, `uid`, `auth`, `mail`, `pass`, `details`) VALUES
	('2Df5hBE', 'XDf5hB3', 'ec49f05c1ddc7d818c61b3343c98cbc6', 'ccio@m03.ca', '5f4dcc3b5aa765d61d8327deb882cf99', '{"days":"0.5"}');
INSERT INTO `Monitors` (`mid`, `ke`, `name`, `shto`, `shfr`, `details`, `type`, `ext`, `protocol`, `host`, `path`, `port`, `fps`, `mode`, `width`, `height`) VALUES ('bunny', '2Df5hBE', 'Bunny', '[]', '[]', '{"model":"RTSP Stream"}', 'h264', 'mp4', 'rtsp', '50.73.56.89', NULL, NULL, '/axis-media/media.3gp', 80, 1, 'record', 1280,720);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
