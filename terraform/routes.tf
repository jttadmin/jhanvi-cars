# ============================================================
# Internet Gateway
# ============================================================

resource "aws_internet_gateway" "jhanvi_cars" {
  vpc_id = aws_vpc.jhanvi_cars.id

  tags = {
    Name    = "${var.project_name}-igw"
    Project = var.project_name
  }
}

# ============================================================
# Public Route Table
# ============================================================

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.jhanvi_cars.id

  tags = {
    Name    = "${var.project_name}-public-rt"
    Project = var.project_name
    Tier    = "public"
  }
}

# -----------------------------
# Internet Route
# -----------------------------

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.jhanvi_cars.id
}

# -----------------------------
# Public Subnet 1
# -----------------------------

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# -----------------------------
# Public Subnet 2
# -----------------------------

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# ============================================================
# Private Route Table
# ============================================================

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.jhanvi_cars.id

  tags = {
    Name    = "${var.project_name}-private-rt"
    Project = var.project_name
    Tier    = "private"
  }
}

# -----------------------------
# Private App Subnet 1
# -----------------------------

resource "aws_route_table_association" "private_app" {
  subnet_id      = aws_subnet.private_app.id
  route_table_id = aws_route_table.private.id
}

# -----------------------------
# Private App Subnet 2
# -----------------------------

resource "aws_route_table_association" "private_app_2" {
  subnet_id      = aws_subnet.private_app_2.id
  route_table_id = aws_route_table.private.id
}

# -----------------------------
# Private DB Subnet
# -----------------------------

resource "aws_route_table_association" "private_db" {
  subnet_id      = aws_subnet.private_db.id
  route_table_id = aws_route_table.private.id
}
