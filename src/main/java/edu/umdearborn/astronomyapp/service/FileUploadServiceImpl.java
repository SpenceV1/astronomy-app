package edu.umdearborn.astronomyapp.service;

import java.io.InputStream;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import edu.umdearborn.astronomyapp.config.GeneralConfig;

@Service
public class FileUploadServiceImpl implements FileUploadService {
	@Value("${s3bucket.accesskey}")
	private String accessKey;
	@Value("${s3bucket.secretkey}")
	private String secretKey;
	@Value("${s3bucket.name:astro-app-file}")
	private String name;
	//regions https://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region
	@Value("${s3bucket.region:us-east-1}")
	private String region;

  private static final Logger logger = LoggerFactory.getLogger(FileUploadServiceImpl.class);

  @Override
  public String upload(InputStream inutStream, long length, String contentType) {
    return init(inutStream, length, contentType).upload(this.accessKey, this.secretKey,this.name, this.region);
  }

  private AwsS3Uploader init(InputStream inutStream, long length, String contentType) {
    return AwsS3Uploader.init(inutStream, length, contentType);
  }

  private static class AwsS3Uploader {
    private AmazonS3    s3;
    private InputStream inputStream;
    private long        contentLength = 0;
    private String      contentType;

    public static AwsS3Uploader init(InputStream inputStream, long length, String contentType) {
      Assert.isTrue(length > 0);
      Assert.isTrue(!StringUtils.isEmpty(contentType));

      AwsS3Uploader uploader = new AwsS3Uploader();
      uploader.inputStream = inputStream;
      uploader.contentLength = length;
      uploader.contentType = contentType;

      logger.info("Created multipart upload request");
      return uploader;
    }

    public String upload(String accessKey, String secretKey, String name, String region) {
    	
	  AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
      this.s3 = AmazonS3ClientBuilder.standard()
			  .withRegion(region)
			  .withCredentials(new AWSStaticCredentialsProvider(credentials)).build();
      
      ObjectMetadata metadata = new ObjectMetadata();
      metadata.setContentLength(contentLength);
      metadata.setContentType(contentType);

      String fileName = UUID.randomUUID().toString();
      s3.putObject(new PutObjectRequest(name, fileName, inputStream, metadata)
          .withCannedAcl(CannedAccessControlList.PublicRead));

      return s3.getUrl(name, fileName).toString();
    }

  }

}
