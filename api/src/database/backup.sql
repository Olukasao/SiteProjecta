/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: projecta
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0+deb12u2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `role` enum('admin','editor') DEFAULT 'admin',
  `ativo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES
(2,'Admin','admin@projecta.com','$2b$10$afcMUNTlKCePRq88U35iT.GHwiYSWuCYjtwor1fsHxgF70RJPcduW','admin',1,'2026-03-24 19:54:52');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `caracteristicas`
--

DROP TABLE IF EXISTS `caracteristicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `caracteristicas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caracteristicas`
--

LOCK TABLES `caracteristicas` WRITE;
/*!40000 ALTER TABLE `caracteristicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `caracteristicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imoveis`
--

DROP TABLE IF EXISTS `imoveis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `imoveis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(12,2) NOT NULL,
  `tipo` enum('casa','apartamento','terreno','comercial') DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `destaque` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `finalidade` enum('venda','aluguel') DEFAULT NULL,
  `cep` varchar(20) DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `preco_condominio` decimal(10,2) DEFAULT 0.00,
  `preco_iptu` decimal(10,2) DEFAULT 0.00,
  `diferenciais` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_cidade` (`cidade`),
  KEY `idx_preco` (`preco`),
  KEY `idx_tipo` (`tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imoveis`
--

LOCK TABLES `imoveis` WRITE;
/*!40000 ALTER TABLE `imoveis` DISABLE KEYS */;
INSERT INTO `imoveis` VALUES
(20,'Residencial Carlos Gouveia','residencial-carlos-gouveia','',204219.60,'apartamento','','Franco da Rocha','Parque Vitória','Rua Zebedeu Marcolino, 137, ',0,'2026-04-28 19:54:49','2026-04-29 18:34:13',NULL,'07855-270',NULL,NULL,20.00,20.00,'[]'),
(21,'Residencial Jacarandas','residencial-jacarandas','Lindo Imóvel e pronto para morar',276500.00,'apartamento','','Franco da Rocha','Portal das Alamedas','Alameda dos Jacarandás, 200, ',0,'2026-04-28 20:10:03','2026-04-29 18:35:02',NULL,'07812-040',NULL,NULL,0.00,0.00,'[]'),
(33,'Residencial Zebebeu','residencial-zebebeu','Apartamento lindo, com otima localização',204219.60,'apartamento','','Franco da Rocha','Parque Vitória','Rua Zebedeu Marcolino, 137, , , ',0,'2026-04-29 15:40:50','2026-04-29 17:52:44',NULL,'07855-270',NULL,NULL,100.00,20.00,'[\"Salão de festas\",\"Piscina\",\"Churrasqueira\",\"Academia\",\"Portaria 24h\",\"Elevador\",\"Mobiliado\",\"Pet friendly\"]'),
(34,'Condominio Aroeiras','condominio-aroeiras','',263245.00,'apartamento','','Franco da Rocha','Portal das Alamedas',', , , , , ',0,'2026-04-29 20:00:31','2026-04-29 20:03:21',NULL,'07812010',NULL,NULL,0.00,0.00,'[]'),
(35,'Casa no portal das Alameda','casa-no-portal-das-alameda','',0.00,'casa','venda','','',', ',0,'2026-04-29 20:23:33','2026-04-29 20:23:33',NULL,'',NULL,NULL,0.00,0.00,'[]');
/*!40000 ALTER TABLE `imoveis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imovel_caracteristicas`
--

DROP TABLE IF EXISTS `imovel_caracteristicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `imovel_caracteristicas` (
  `imovel_id` int(11) NOT NULL,
  `caracteristica_id` int(11) NOT NULL,
  PRIMARY KEY (`imovel_id`,`caracteristica_id`),
  KEY `caracteristica_id` (`caracteristica_id`),
  CONSTRAINT `imovel_caracteristicas_ibfk_1` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`) ON DELETE CASCADE,
  CONSTRAINT `imovel_caracteristicas_ibfk_2` FOREIGN KEY (`caracteristica_id`) REFERENCES `caracteristicas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imovel_caracteristicas`
--

LOCK TABLES `imovel_caracteristicas` WRITE;
/*!40000 ALTER TABLE `imovel_caracteristicas` DISABLE KEYS */;
/*!40000 ALTER TABLE `imovel_caracteristicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imovel_detalhes`
--

DROP TABLE IF EXISTS `imovel_detalhes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `imovel_detalhes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `imovel_id` int(11) NOT NULL,
  `quartos` int(11) DEFAULT 0,
  `banheiros` int(11) DEFAULT 0,
  `vagas` int(11) DEFAULT 0,
  `area` decimal(10,2) DEFAULT NULL,
  `suites` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `imovel_id` (`imovel_id`),
  CONSTRAINT `imovel_detalhes_ibfk_1` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imovel_detalhes`
--

LOCK TABLES `imovel_detalhes` WRITE;
/*!40000 ALTER TABLE `imovel_detalhes` DISABLE KEYS */;
INSERT INTO `imovel_detalhes` VALUES
(17,20,2,1,1,35.00,0),
(18,21,2,2,1,46.00,2),
(25,33,2,1,1,34.45,1),
(26,34,2,2,1,0.00,2),
(27,35,3,2,1,0.00,1);
/*!40000 ALTER TABLE `imovel_detalhes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imovel_imagens`
--

DROP TABLE IF EXISTS `imovel_imagens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `imovel_imagens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `imovel_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `principal` tinyint(1) DEFAULT 0,
  `ordem` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `imovel_id` (`imovel_id`),
  CONSTRAINT `imovel_imagens_ibfk_1` FOREIGN KEY (`imovel_id`) REFERENCES `imoveis` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=519 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imovel_imagens`
--

LOCK TABLES `imovel_imagens` WRITE;
/*!40000 ALTER TABLE `imovel_imagens` DISABLE KEYS */;
INSERT INTO `imovel_imagens` VALUES
(348,33,'http://192.168.1.133:3500/uploads/1777477250659.jpeg',0,0),
(349,33,'http://192.168.1.133:3500/uploads/1777477250691.jpeg',0,0),
(350,33,'http://192.168.1.133:3500/uploads/1777477250706.jpeg',0,0),
(351,33,'http://192.168.1.133:3500/uploads/1777477250722.jpeg',0,0),
(352,33,'http://192.168.1.133:3500/uploads/1777477250741.jpeg',0,0),
(353,33,'http://192.168.1.133:3500/uploads/1777477250750.jpeg',0,0),
(354,33,'http://192.168.1.133:3500/uploads/1777477250758.jpeg',0,0),
(355,33,'http://192.168.1.133:3500/uploads/1777477250770.jpeg',0,0),
(356,33,'http://192.168.1.133:3500/uploads/1777477250779.jpeg',0,0),
(357,33,'http://192.168.1.133:3500/uploads/1777477250787.jpeg',0,0),
(358,33,'http://192.168.1.133:3500/uploads/1777477250809.jpeg',0,0),
(359,33,'http://192.168.1.133:3500/uploads/1777477250815.jpeg',0,0),
(360,33,'http://192.168.1.133:3500/uploads/1777477250831.jpeg',0,0),
(361,33,'http://192.168.1.133:3500/uploads/1777477250847.jpeg',0,0),
(362,33,'http://192.168.1.133:3500/uploads/1777477250855.jpeg',0,0),
(363,33,'http://192.168.1.133:3500/uploads/1777477250871.jpeg',0,0),
(364,33,'http://192.168.1.133:3500/uploads/1777477250884.jpeg',0,0),
(365,33,'http://192.168.1.133:3500/uploads/1777477250898.jpeg',0,0),
(366,33,'http://192.168.1.133:3500/uploads/1777477250904.jpeg',0,0),
(367,33,'http://192.168.1.133:3500/uploads/1777477250918.jpeg',0,0),
(368,33,'http://192.168.1.133:3500/uploads/1777477250936.jpeg',0,0),
(369,33,'http://192.168.1.133:3500/uploads/1777477250948.jpeg',0,0),
(370,33,'http://192.168.1.133:3500/uploads/1777477250956.jpeg',0,0),
(371,33,'http://192.168.1.133:3500/uploads/1777477250968.jpeg',0,0),
(373,20,'http://192.168.1.133:3500/uploads/1777406089983.jpeg',0,0),
(374,21,'http://192.168.1.133:3500/uploads/1777407000561.jpg',0,0),
(375,21,'http://192.168.1.133:3500/uploads/1777407000632.jpg',0,0),
(376,21,'http://192.168.1.133:3500/uploads/1777407000696.jpg',0,0),
(377,21,'http://192.168.1.133:3500/uploads/1777407000754.jpg',0,0),
(378,21,'http://192.168.1.133:3500/uploads/1777407000819.jpg',0,0),
(379,21,'http://192.168.1.133:3500/uploads/1777407000901.jpg',0,0),
(380,21,'http://192.168.1.133:3500/uploads/1777407000985.jpg',0,0),
(381,21,'http://192.168.1.133:3500/uploads/1777407001070.jpg',0,0),
(382,21,'http://192.168.1.133:3500/uploads/1777407001153.jpg',0,0),
(383,21,'http://192.168.1.133:3500/uploads/1777407001237.jpg',0,0),
(384,21,'http://192.168.1.133:3500/uploads/1777407001322.jpg',0,0),
(385,21,'http://192.168.1.133:3500/uploads/1777407001407.jpg',0,0),
(386,21,'http://192.168.1.133:3500/uploads/1777407001492.jpg',0,0),
(387,21,'http://192.168.1.133:3500/uploads/1777407001592.jpg',0,0),
(388,21,'http://192.168.1.133:3500/uploads/1777407001692.jpg',0,0),
(389,21,'http://192.168.1.133:3500/uploads/1777407001791.jpg',0,0),
(390,21,'http://192.168.1.133:3500/uploads/1777407001895.jpg',0,0),
(391,21,'http://192.168.1.133:3500/uploads/1777407001978.jpg',0,0),
(392,21,'http://192.168.1.133:3500/uploads/1777407002062.jpg',0,0),
(393,21,'http://192.168.1.133:3500/uploads/1777407002148.jpg',0,0),
(394,21,'http://192.168.1.133:3500/uploads/1777407002246.jpg',0,0),
(395,21,'http://192.168.1.133:3500/uploads/1777407002356.jpg',0,0),
(396,21,'http://192.168.1.133:3500/uploads/1777407002440.jpg',0,0),
(397,21,'http://192.168.1.133:3500/uploads/1777407002524.jpg',0,0),
(398,21,'http://192.168.1.133:3500/uploads/1777407002609.jpg',0,0),
(399,21,'http://192.168.1.133:3500/uploads/1777407002703.jpg',0,0),
(400,21,'http://192.168.1.133:3500/uploads/1777407002806.jpg',0,0),
(401,21,'http://192.168.1.133:3500/uploads/1777407002887.jpg',0,0),
(402,21,'http://192.168.1.133:3500/uploads/1777407002971.jpg',0,0),
(403,21,'http://192.168.1.133:3500/uploads/1777407003054.jpg',0,0),
(404,21,'http://192.168.1.133:3500/uploads/1777407003146.jpg',0,0),
(405,21,'http://192.168.1.133:3500/uploads/1777407003247.jpg',0,0),
(406,21,'http://192.168.1.133:3500/uploads/1777407003325.jpg',0,0),
(407,21,'http://192.168.1.133:3500/uploads/1777407003410.jpg',0,0),
(488,34,'http://192.168.1.133:3500/uploads/1777492831628.jpeg',0,0),
(489,34,'http://192.168.1.133:3500/uploads/1777492831668.jpeg',0,0),
(490,34,'http://192.168.1.133:3500/uploads/1777492831688.jpeg',0,0),
(491,34,'http://192.168.1.133:3500/uploads/1777492831714.jpeg',0,0),
(492,34,'http://192.168.1.133:3500/uploads/1777492831735.jpeg',0,0),
(493,34,'http://192.168.1.133:3500/uploads/1777492831764.jpeg',0,0),
(494,34,'http://192.168.1.133:3500/uploads/1777492831795.jpeg',0,0),
(495,34,'http://192.168.1.133:3500/uploads/1777492831823.jpeg',0,0),
(496,34,'http://192.168.1.133:3500/uploads/1777492831837.jpeg',0,0),
(497,34,'http://192.168.1.133:3500/uploads/1777492831858.jpeg',0,0),
(498,34,'http://192.168.1.133:3500/uploads/1777492831871.jpeg',0,0),
(499,34,'http://192.168.1.133:3500/uploads/1777492831882.jpeg',0,0),
(500,34,'http://192.168.1.133:3500/uploads/1777492831894.jpeg',0,0),
(501,34,'http://192.168.1.133:3500/uploads/1777492831912.jpeg',0,0),
(502,34,'http://192.168.1.133:3500/uploads/1777492831931.jpeg',0,0),
(503,34,'http://192.168.1.133:3500/uploads/1777492831941.jpeg',0,0),
(504,35,'http://192.168.1.133:3500/uploads/1777494213648.jpeg',0,0),
(505,35,'http://192.168.1.133:3500/uploads/1777494213661.jpeg',0,0),
(506,35,'http://192.168.1.133:3500/uploads/1777494213678.jpeg',0,0),
(507,35,'http://192.168.1.133:3500/uploads/1777494213684.jpeg',0,0),
(508,35,'http://192.168.1.133:3500/uploads/1777494213710.jpeg',0,0),
(509,35,'http://192.168.1.133:3500/uploads/1777494213712.jpeg',0,0),
(510,35,'http://192.168.1.133:3500/uploads/1777494213714.jpeg',0,0),
(511,35,'http://192.168.1.133:3500/uploads/1777494213722.jpeg',0,0),
(512,35,'http://192.168.1.133:3500/uploads/1777494213725.jpeg',0,0),
(513,35,'http://192.168.1.133:3500/uploads/1777494213733.jpeg',0,0),
(514,35,'http://192.168.1.133:3500/uploads/1777494213744.jpeg',0,0),
(515,35,'http://192.168.1.133:3500/uploads/1777494213745.jpeg',0,0),
(516,35,'http://192.168.1.133:3500/uploads/1777494213746.jpeg',0,0),
(517,35,'http://192.168.1.133:3500/uploads/1777494213747.jpeg',0,0),
(518,35,'http://192.168.1.133:3500/uploads/1777494213750.jpeg',0,0);
/*!40000 ALTER TABLE `imovel_imagens` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-30 10:03:06
