package com.raktsetu.dao;

import com.raktsetu.model.User;
import java.sql.SQLException;

/** Defines user persistence operations independently of the database implementation. */
public interface UserDao {
    User findByEmail(String email) throws SQLException;
    User findById(long id) throws SQLException;
    long create(User user, String passwordHash) throws SQLException;
}
