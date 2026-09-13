resource "aws_instance" "jhanvi_cars_backend" {
  ami           = "ami-0fe8c3d780d8bf58b"
  instance_type = "t3.micro"

  subnet_id                   = aws_subnet.public_2.id
  vpc_security_group_ids      = [aws_security_group.backend.id]
  associate_public_ip_address = true

  tags = {
    Name = "jhanvi-cars-backend"
  }
}
