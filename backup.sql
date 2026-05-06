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
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `role` enum('admin','editor') DEFAULT 'editor',
  `status` enum('active','inactive','banned') DEFAULT 'active',
  `phone` varchar(20) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES
(1,'Admin master','Admin','admin@projecta.com.br','$2b$10$PcGX4w27WVLWDy5ntuplPemr49YyszVIA5UOR13XaGEax9D1L7xra','admin','active',NULL,NULL,NULL,'2026-05-04 18:58:58','2026-05-04 20:53:45',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imoveis`
--

LOCK TABLES `imoveis` WRITE;
/*!40000 ALTER TABLE `imoveis` DISABLE KEYS */;
INSERT INTO `imoveis` VALUES
(36,'Residencial Zebebeu','residencial-zebebeu','',204219.60,'apartamento','venda','Franco da Rocha','Parque Vitória','Rua Zebedeu Marcolino, 137',0,'2026-04-30 19:17:31','2026-04-30 19:17:31',NULL,'07855-270',NULL,NULL,100.00,65.00,'[\"Piscina\",\"Churrasqueira\",\"Academia\",\"Portaria 24h\",\"Elevador\",\"Mobiliado\",\"Pet friendly\",\"Salão de festas\"]'),
(37,'Carlos Gouveia','carlos-gouveia','',204219.60,'apartamento','venda','Franco da Rocha','Parque Vitória','Rua Zebedeu Marcolino, 137',0,'2026-04-30 19:25:13','2026-04-30 19:25:13',NULL,'07855-270',NULL,NULL,100.00,20.00,'[\"Piscina\",\"Churrasqueira\",\"Portaria 24h\",\"Academia\",\"Elevador\",\"Mobiliado\",\"Pet friendly\",\"Salão de festas\"]');
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imovel_detalhes`
--

LOCK TABLES `imovel_detalhes` WRITE;
/*!40000 ALTER TABLE `imovel_detalhes` DISABLE KEYS */;
INSERT INTO `imovel_detalhes` VALUES
(28,36,2,1,1,34.45,2),
(29,37,2,1,2,35.00,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=567 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imovel_imagens`
--

LOCK TABLES `imovel_imagens` WRITE;
/*!40000 ALTER TABLE `imovel_imagens` DISABLE KEYS */;
INSERT INTO `imovel_imagens` VALUES
(519,36,'http://192.168.1.133:3500/uploads/1777576650448.jpeg',0,0),
(520,36,'http://192.168.1.133:3500/uploads/1777576650505.jpeg',0,0),
(521,36,'http://192.168.1.133:3500/uploads/1777576650522.jpeg',0,0),
(522,36,'http://192.168.1.133:3500/uploads/1777576650541.jpeg',0,0),
(523,36,'http://192.168.1.133:3500/uploads/1777576650558.jpeg',0,0),
(524,36,'http://192.168.1.133:3500/uploads/1777576650567.jpeg',0,0),
(525,36,'http://192.168.1.133:3500/uploads/1777576650613.jpeg',0,0),
(526,36,'http://192.168.1.133:3500/uploads/1777576650616.jpeg',0,0),
(527,36,'http://192.168.1.133:3500/uploads/1777576650632.jpeg',0,0),
(528,36,'http://192.168.1.133:3500/uploads/1777576650661.jpeg',0,0),
(529,36,'http://192.168.1.133:3500/uploads/1777576650715.jpeg',0,0),
(530,36,'http://192.168.1.133:3500/uploads/1777576650731.jpeg',0,0),
(531,36,'http://192.168.1.133:3500/uploads/1777576650772.jpeg',0,0),
(532,36,'http://192.168.1.133:3500/uploads/1777576650860.jpeg',0,0),
(533,36,'http://192.168.1.133:3500/uploads/1777576650865.jpeg',0,0),
(534,36,'http://192.168.1.133:3500/uploads/1777576650879.jpeg',0,0),
(535,36,'http://192.168.1.133:3500/uploads/1777576650907.jpeg',0,0),
(536,36,'http://192.168.1.133:3500/uploads/1777576650928.jpeg',0,0),
(537,36,'http://192.168.1.133:3500/uploads/1777576650937.jpeg',0,0),
(538,36,'http://192.168.1.133:3500/uploads/1777576650979.jpeg',0,0),
(539,36,'http://192.168.1.133:3500/uploads/1777576651063.jpeg',0,0),
(540,36,'http://192.168.1.133:3500/uploads/1777576651098.jpeg',0,0),
(541,36,'http://192.168.1.133:3500/uploads/1777576651145.jpeg',0,0),
(542,36,'http://192.168.1.133:3500/uploads/1777576651163.jpeg',0,0),
(543,37,'http://192.168.1.133:3500/uploads/1777577113210.jpeg',0,0),
(544,37,'http://192.168.1.133:3500/uploads/1777577113252.jpeg',0,0),
(545,37,'http://192.168.1.133:3500/uploads/1777577113270.jpeg',0,0),
(546,37,'http://192.168.1.133:3500/uploads/1777577113286.jpeg',0,0),
(547,37,'http://192.168.1.133:3500/uploads/1777577113298.jpeg',0,0),
(548,37,'http://192.168.1.133:3500/uploads/1777577113313.jpeg',0,0),
(549,37,'http://192.168.1.133:3500/uploads/1777577113320.jpeg',0,0),
(550,37,'http://192.168.1.133:3500/uploads/1777577113329.jpeg',0,0),
(551,37,'http://192.168.1.133:3500/uploads/1777577113343.jpeg',0,0),
(552,37,'http://192.168.1.133:3500/uploads/1777577113351.jpeg',0,0),
(553,37,'http://192.168.1.133:3500/uploads/1777577113370.jpeg',0,0),
(554,37,'http://192.168.1.133:3500/uploads/1777577113386.jpeg',0,0),
(555,37,'http://192.168.1.133:3500/uploads/1777577113405.jpeg',0,0),
(556,37,'http://192.168.1.133:3500/uploads/1777577113434.jpeg',0,0),
(557,37,'http://192.168.1.133:3500/uploads/1777577113467.jpeg',0,0),
(558,37,'http://192.168.1.133:3500/uploads/1777577113481.jpeg',0,0),
(559,37,'http://192.168.1.133:3500/uploads/1777577113488.jpeg',0,0),
(560,37,'http://192.168.1.133:3500/uploads/1777577113510.jpeg',0,0),
(561,37,'http://192.168.1.133:3500/uploads/1777577113523.jpeg',0,0),
(562,37,'http://192.168.1.133:3500/uploads/1777577113536.jpeg',0,0),
(563,37,'http://192.168.1.133:3500/uploads/1777577113559.jpeg',0,0),
(564,37,'http://192.168.1.133:3500/uploads/1777577113568.jpeg',0,0),
(565,37,'http://192.168.1.133:3500/uploads/1777577113583.jpeg',0,0),
(566,37,'http://192.168.1.133:3500/uploads/1777577113600.jpeg',0,0);
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

-- Dump completed on 2026-05-06 13:44:36
