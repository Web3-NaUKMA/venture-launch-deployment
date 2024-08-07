use serde::Deserialize;
use sqlx::PgPool;

use crate::models::user::create_user;
use crate::models::user_role::{add_roles_by_email, UserRole};

#[derive(Deserialize, Debug)]
pub struct CreateDaoSchema {
    email: String,
    password: String,
    roles: Vec<UserRole>,
    employee_id: i32,
}

pub async fn consume(request: CreateDaoSchema, database_connection: &PgPool) -> Result<String, String> {
    create_user(&request.email, &request.password, request.employee_id, database_connection).await?;
    add_roles_by_email(&request.email, &request.roles, database_connection).await?;

    Ok(format!("User {} created successfully with roles: {:?}", request.email, request.roles))
}