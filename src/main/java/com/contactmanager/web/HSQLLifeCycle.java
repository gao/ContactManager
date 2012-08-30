package com.contactmanager.web;

import java.sql.SQLException;
import java.sql.Statement;

import org.hsqldb.Server;

import com.britesnow.snow.web.WebApplicationLifecycle;
import com.britesnow.snow.web.db.hibernate.HibernateDaoHelper;
import com.britesnow.snow.web.db.hibernate.HibernateSessionInViewHandler;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class HSQLLifeCycle implements WebApplicationLifecycle {
    
    @Inject
    private HibernateDaoHelper hibernateDaoHelper;
    
    @Inject
    HibernateSessionInViewHandler hibernateSessionInViewHandler;

    public HSQLLifeCycle(){
        
        Server server = new Server();
        server.setDatabaseName(0, "contactdb");
        server.setDatabasePath(0, getClass().getResource("/")+"hqldb/contactdb");
        server.start();
        try {
            Thread.sleep(800);
        } catch (InterruptedException e) {
            // do nothing
        }  
        System.out.println("HSQLDB started...");
        
    }
    
    @Override
    public void init() {
        createTables();
    }

    @Override
    public void shutdown() {
        Statement statement = null;
        try {
            hibernateSessionInViewHandler.openSessionInView();
            System.out.println("HSQLDB stoped...");
            statement = hibernateDaoHelper.getConnection().createStatement();
            statement.executeUpdate("SHUTDOWN;");
        } catch (SQLException e) {
            e.printStackTrace();
        } finally{
            if(statement != null){
                try {
                    statement.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            hibernateSessionInViewHandler.closeSessionInView();
        }
    }
    
    private void createTables(){
        hibernateSessionInViewHandler.openSessionInView();
        Statement statement = null;
        try {
            statement = hibernateDaoHelper.getConnection().createStatement();
            // create group
            statement.executeUpdate("create table t_group (id bigint GENERATED BY DEFAULT AS IDENTITY(START WITH 1) not null primary key,name varchar,createdby_id bigint, created_date date,updatedby_id bigint,updated_date date)");
            // create contact
            statement.executeUpdate("create table t_contact (id bigint GENERATED BY DEFAULT AS IDENTITY(START WITH 1) not null primary key,name varchar,address varchar,phone varchar,email varchar,createdby_id bigint, created_date date,updatedby_id bigint,updated_date date)");
            // create group contact
            statement.executeUpdate("create table t_group_contact (id bigint GENERATED BY DEFAULT AS IDENTITY(START WITH 1) not null primary key,group_id bigint, contact_id bigint)");
        } catch (SQLException e) {
            e.printStackTrace();
        } finally{
            if(statement != null){
                try {
                    statement.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            hibernateSessionInViewHandler.closeSessionInView();
        }
    }

}
