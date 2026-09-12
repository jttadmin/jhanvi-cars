# ============================================================
# Availability Zone 1 - ap-south-2a
# ============================================================

# -----------------------------
# Public Subnet - AZ 1
# -----------------------------

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.jhanvi_cars.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-2a"
  map_public_ip_on_launch = true

  tags = {
    Name    = "${var.project_name}-public-subnet-1"
    Project = var.project_name
    Tier    = "public"
  }
}

# -----------------------------
# Private App Subnet - AZ 1
# -----------------------------

resource "aws_subnet" "private_app" {
  vpc_id            = aws_vpc.jhanvi_cars.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-south-2a"

  tags = {
    Name    = "${var.project_name}-private-app-subnet-1"
    Project = var.project_name
    Tier    = "private-app"
  }
}

# -----------------------------
# Private DB Subnet - AZ 1
# -----------------------------

resource "aws_subnet" "private_db" {
  vpc_id            = aws_vpc.jhanvi_cars.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "ap-south-2a"

  tags = {
    Name    = "${var.project_name}-private-db-subnet-1"
    Project = var.project_name
    Tier    = "private-db"
  }
}

# ============================================================
# Availability Zone 2 - ap-south-2b
# ============================================================

# -----------------------------
# Public Subnet - AZ 2
# -----------------------------

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.jhanvi_cars.id
  cidr_block              = "10.0.4.0/24"
  availability_zone       = "ap-south-2b"
  map_public_ip_on_launch = true

  tags = {
    Name    = "${var.project_name}-public-subnet-2"
    Project = var.project_name
    Tier    = "public"
  }
}

# -----------------------------
# Private App Subnet - AZ 2
# -----------------------------

resource "aws_subnet" "private_app_2" {
  vpc_id            = aws_vpc.jhanvi_cars.id
  cidr_block        = "10.0.5.0/24"
  availability_zone = "ap-south-2b"

  tags = {
    Name    = "${var.project_name}-private-app-subnet-2"
    Project = var.project_name
    Tier    = "private-app"
  }
}
