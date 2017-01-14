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
	('2Df5hBE', 'XDf5hB3', 'ec49f05c1ddc7d818c61b3343c98cbc6', 'ccio@m03.ca', '5f4dcc3b5aa765d61d8327deb882cf99', '{"days":"10"}');
INSERT INTO `Monitors` (`mid`, `ke`, `name`, `shto`, `shfr`, `details`, `type`, `ext`, `protocol`, `host`, `path`, `port`, `fps`, `mode`, `width`, `height`) VALUES ('bunny', '2Df5hBE', 'Bunny', '[]', '[]', '{"vcodec":"copy","crf":"","acodec":"libvorbis","muser":"","mpass":"","sfps":"","timestamp":"1","vf":"","svf":"","cutoff":"10","control":"1","control_stop":null,"control_url_stop_timeout":"","control_url_center":"/nphControlCamera?Direction=HomePosition","control_url_left":"/nphControlCamera?Direction=PanLeft","control_url_left_stop":"","control_url_right":"/nphControlCamera?Direction=PanRight","control_url_right_stop":"","control_url_up":"/nphControlCamera?Direction=TiltUp","control_url_up_stop":"","control_url_down":"/nphControlCamera?Direction=TiltDown","control_url_down_stop":""}', 'mjpeg', 'mp4', 'http', 'came3.nkansai.ne.jp', '/nphMotionJpeg?Resolution=640x480&Quality=Motion', 81, 15, 'start', 640, 480);
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
