package edu.umdearborn.astronomyapp.service;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.google.common.collect.ImmutableMap;

import edu.umdearborn.astronomyapp.entity.AstroAppUser;
import edu.umdearborn.astronomyapp.entity.Module;
import edu.umdearborn.astronomyapp.util.ResultListUtil;

@Service
@Transactional
public class GradeServiceImpl implements GradeService {

  private static final Logger logger = LoggerFactory.getLogger(GradeServiceImpl.class);

  private EntityManager entityManager;

  public GradeServiceImpl(EntityManager entityManager) {
    this.entityManager = entityManager;
  }

  @SuppressWarnings({"unchecked", "rawtypes"})
  @Override
  public void exportGrades(String courseId, OutputStream outputStream) {
    Map<String, Module> modules = Optional
        .ofNullable(entityManager.createQuery(
            "select m from Module m join m.course c where c.id = :courseId order by m.id",
            Module.class).setParameter("courseId", courseId).getResultList())
        .orElseGet(ArrayList<Module>::new).parallelStream()
        .collect(Collectors.toMap(e -> e.getId(), e -> e));

    List<String> csvHeaderOrder = modules.keySet().parallelStream().collect(Collectors.toList());
    List<String> csvHeader = csvHeaderOrder.stream().map(e -> modules.get(e).getModuleTitle())
        .collect(Collectors.toList());
    csvHeader.add(0, "Last, First");
    csvHeader.add(1, "Email");
    String[] csvHeaderArr = new String[csvHeader.size()];

    Writer writer = new OutputStreamWriter(outputStream);

    try (CSVPrinter printer =
        new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(csvHeader.toArray(csvHeaderArr)))) {
      List<Iterable> records = new ArrayList<>();
      getUsers(courseId).forEach(e -> {
        List<Object> record = new ArrayList<>();
        record.add(e.getLastName() + ", " + e.getFirstName());
        record.add(e.getEmail());
        Map<String, Object> studentGrades = viewStudentGrades(e.getEmail(), courseId);
        csvHeaderOrder.stream().forEachOrdered(f -> {
          //logger.info("Adding points for {} in module: '{}'", e, f);
          record.add(((Map<String, Object>) studentGrades.get(f)).get("pointsEarned"));
        });
        records.add(record);
      });

      for (Iterable iter : records) {
        printer.printRecord(iter);
      }

    } catch (IOException ioe) {
      logger.error("Error occured creating grades for course: '" + courseId + "'", ioe);
    } finally {
      IOUtils.closeQuietly(writer);
    }
    // List<String> modules = Optional
    // .ofNullable(entityManager
    // .createQuery("select m.id from Module m join m.course c where c.id = :courseId",
    // String.class)
    // .setParameter("courseId", courseId).getResultList())
    // .orElseGet(ArrayList<String>::new);
    //
    // Writer writer = new OutputStreamWriter(outputStream);
    //
    // try (CSVPrinter printer =
    // new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader("email", "module", "grade"))) {
    //
    // modules.forEach(e -> {
    // Map<String, Object> grades =
    // Optional.ofNullable(getGrades(courseId, e)).orElseGet(HashMap<String, Object>::new);
    //
    // grades.entrySet().forEach(f -> {
    // Map<String, Object> grade = (Map<String, Object>) f.getValue();
    // try {
    // logger.debug("Appending email: '{}', module: '{}', grade: '{}'", f.getKey(), e,
    // grade.get("pointsEarned"));
    // printer.printRecord(f.getKey(), e, grade.get("pointsEarned"));
    // } catch (IOException ioe) {
    // logger.error("Error occured printing record for user: '" + f.getKey()
    // + "' for module: '" + e + "'", ioe);
    // }
    // });
    // });
    //
    // } catch (IOException ioe) {
    // logger.error("Error occured creating grades for course: '" + courseId + "'", ioe);
    // } finally {
    // IOUtils.closeQuietly(writer);
    // }
  }

  @Override
  public Map<String, Object> getGrades(String courseId, String moduleId) {
    List<String> users = getUserEmails(courseId);
    if (users.isEmpty()) {
      return null;
    }
    return users.parallelStream().collect(Collectors.toMap(e -> e, e -> getGrade(e, moduleId)));
  }

  private List<String> getUserEmails(String courseId) {
    return Optional.ofNullable(entityManager
        .createQuery(
            "select u.email from CourseUser cu join cu.user u join cu.course c where c.id = :courseId "
                + "and cu.role = 'STUDENT'",
            String.class)
        .setParameter("courseId", courseId).getResultList()).orElse(new ArrayList<String>());
  }
  
  private List<AstroAppUser> getUsers(String courseId) {
	    
	  List<AstroAppUser> users = entityManager
        .createQuery(
            "select u from CourseUser cu join cu.user u join cu.course c where c.id = :courseId "
                + "and cu.role = 'STUDENT'",
                AstroAppUser.class)
        .setParameter("courseId", courseId).getResultList();
	  return users;
  }

  @Override
  public Map<String, Object> getGrade(String email, String moduleId) {
	  return getGradeUniversal(email, moduleId, false);
  }
  
  @Override
  public Map<String, Object> getGroupGrade(String groupId, String moduleId) {
	  return getGradeUniversal(groupId, moduleId, true);
  }
  
  @Override
  public Map<String, Object> getGradeUniversal(String emailOrGroupId, String moduleId, boolean isGroupId) {
	  	String groupId = emailOrGroupId;
	  	if(!isGroupId) {
	  		String email = emailOrGroupId;
		    logger.debug("Getting groupdId for user '{}' in module: '{}'", email, moduleId);
		    List<String> results = entityManager
		        .createQuery("select g.id from GroupMember gm join gm.moduleGroup g join g.module m "
		            + "join gm.courseUser cu join cu.user u where lower(u.email) = lower(:email) and "
		            + "m.id = :moduleId", String.class)
		        .setParameter("email", email).setParameter("moduleId", moduleId).getResultList();
			if (ResultListUtil.hasResult(results)) {
				groupId = results.get(0);
			} else {
				  logger.debug("User: '{}' has no group for module: '{}'", email, moduleId);
				    return ImmutableMap.of("groupId", groupId, "pointsEarned", BigDecimal.ZERO, "submissionNumber", 0L,
				        "finishedGrading", true);
			}
	  	}

        logger.debug("Getting points for group: '{}' for module: '{}'", groupId, moduleId);
        Object[] submission = Optional.ofNullable(entityManager
            .createQuery(
                "select coalesce(sum(a.pointesEarned), 0), "
                + "max(a.submissionTimestamp), "
                + "case when (sum(case when a.pointesEarned is null then 1 else 0 end) > 0) then false else true end, " //equal to "bool_and(pointes_earned is not null)
                + "max(a.submissionNumber) from Answer a join a.group g where g.id = :groupId",
                Object[].class)
            .setParameter("groupId", groupId).getSingleResult()).orElse(null);
        
        if(submission != null && submission[3] != null) { //submission number != null
        	BigDecimal pointsEarned = (BigDecimal)submission[0];
        	Date submissionTimestamp = (Date)submission[1];
        	Boolean finishedGrading = (Boolean)submission[2];
        	Long submissionNumber = (Long)submission[3];
        	
        	return ImmutableMap.of("groupId", groupId, "pointsEarned", pointsEarned, "submissionTimestamp", submissionTimestamp,
    	            "submissionNumber", submissionNumber, "finishedGrading", finishedGrading);
        	//logger.info("Points Earned: {}, Timestamp: {}, Graded {}, Submission: {}", pointsEarned, submissionTimestamp, graded, submissionNumber);
        } else {
        	//logger.info("No submission for group");
        }
        
        return ImmutableMap.of("groupId", groupId, "pointsEarned", BigDecimal.ZERO, "submissionNumber", 0L,
		        "finishedGrading", true);
  }
  
  @Override
  public Map<String, Object> getModuleGrades(String moduleId) {
	  	Map<String, Object> gradesMap = new HashMap<String, Object>();
	  	
        List<Object[]> gradesResult = entityManager
            .createQuery(
                "select g.id, "
            	+ "coalesce(sum(a.pointesEarned), 0), "
                + "max(a.submissionTimestamp), "
                + "case when (sum(case when a.pointesEarned is null then 1 else 0 end) > 0) then false else true end, " //equal to "bool_and(pointes_earned is not null)
                + "max(a.submissionNumber) from Answer a join a.group g join g.module m where m.id = :moduleId GROUP BY g.id",
                Object[].class)
            .setParameter("moduleId", moduleId)
            .getResultList();
        
        if(ResultListUtil.hasResult(gradesResult)) {
        	for(Object[] groupGrade : gradesResult) {
        		String groupId = (String)groupGrade[0];
            	BigDecimal pointsEarned = (BigDecimal)groupGrade[1];
            	Date submissionTimestamp = (Date)groupGrade[2];
            	Boolean finishedGrading = (Boolean)groupGrade[3];
            	Long submissionNumber = (Long)groupGrade[4];
            	
            	Map<String, Object> grade = ImmutableMap.of("groupId", groupId, "pointsEarned", pointsEarned, "submissionTimestamp", submissionTimestamp,
        	            "submissionNumber", submissionNumber, "finishedGrading", finishedGrading);
            	
            	gradesMap.put((String)grade.get("groupId"), grade);
        	}
        }
        
        return gradesMap;
  }

  @Override
  public Map<String, Object> viewStudentGrades(String email, String courseId) {
    return Optional
        .ofNullable(entityManager
            .createQuery("select m.id from Module m join m.course c where c.id = :courseId",
                String.class)
            .setParameter("courseId", courseId).getResultList())
        .orElseGet(ArrayList<String>::new).stream()
        .collect(Collectors.toMap(e -> e, e -> getGrade(email, e)));
  }
}
