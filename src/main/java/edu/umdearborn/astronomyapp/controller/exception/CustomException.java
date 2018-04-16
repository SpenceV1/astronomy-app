package edu.umdearborn.astronomyapp.controller.exception;

public class CustomException extends RuntimeException {

  private static final long serialVersionUID = -7822983110056957517L;

  public CustomException(String message) {
    super(message);
  }
}
