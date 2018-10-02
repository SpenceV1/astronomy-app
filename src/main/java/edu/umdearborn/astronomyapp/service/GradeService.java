package edu.umdearborn.astronomyapp.service;

import java.io.OutputStream;
import java.util.Map;

public interface GradeService {

  public void exportGrades(String courseId, OutputStream outputStream);

  public Map<String, Object> getGrades(String courseId, String moduleId);

  public Map<String, Object> getGrade(String email, String moduleId);

  public Map<String, Object> viewStudentGrades(String email, String courseId);
  
  public Map<String, Object> getGroupGrade(String groupId, String moduleId);
  
  Map<String, Object> getGradeUniversal(String emailOrGroupId, String moduleId, boolean isGroupId);

  public Map<String, Object> getModuleGrades(String moduleId);
}
