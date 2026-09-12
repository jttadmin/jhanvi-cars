variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-2"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "jhanvi-cars"
}

variable "vpc_cidr" {
  description = "CIDR block for Jhanvi Cars VPC"
  type        = string
  default     = "10.0.0.0/16"
}
