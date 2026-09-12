# -----------------------------
# VPC
# -----------------------------

output "vpc_id" {
  description = "Jhanvi Cars VPC ID"
  value       = aws_vpc.jhanvi_cars.id
}

# -----------------------------
# Subnets
# -----------------------------

output "public_subnet_1_id" {
  description = "Public subnet in ap-south-2a"
  value       = aws_subnet.public.id
}

output "public_subnet_2_id" {
  description = "Public subnet in ap-south-2b"
  value       = aws_subnet.public_2.id
}

output "private_app_subnet_1_id" {
  description = "Private app subnet in ap-south-2a"
  value       = aws_subnet.private_app.id
}

output "private_app_subnet_2_id" {
  description = "Private app subnet in ap-south-2b"
  value       = aws_subnet.private_app_2.id
}

output "private_db_subnet_id" {
  description = "Private DB subnet in ap-south-2a"
  value       = aws_subnet.private_db.id
}
