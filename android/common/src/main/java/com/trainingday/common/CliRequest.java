package com.trainingday.common;

import org.json.JSONObject;

public final class CliRequest {
  public final String command;
  public final JSONObject params; // nullable for some type of commands

  public CliRequest(String command, JSONObject params) {
    this.command = command;
    this.params = params;
  }

  public String encode() { return params == null ? command : command + " " + params; }

  public static CliRequest decode(String request) {
    return request.contains(" ") ?
      new CliRequest(request.substring(0, request.indexOf(" ")), new JSONObject(request.substring(request.indexOf(" ") + 1))) :
      new CliRequest(request, null);
  }

}
