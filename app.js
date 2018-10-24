// Global letiable
BASE_URL = "https://api.github.com/";

$(document).ready(function() {
  localStorage.removeItem("repo");
  localStorage.removeItem("username");
  localStorage.removeItem("accessToken");

  $("#getRepo").click(function() {
    let username = $("#username").val();
    let password = $("#password").val();
    let search = $("#gitusername").val() ? $("#gitusername").val() : username;

    if (username && password) {
      $(".error")
        .removeClass("d-block")
        .addClass("d-none")
        .html("");
      $("#repoUser").html("of " + username);
      localStorage.setItem("username", username);
      if (!localStorage.getItem("accessToken"))
        createToken(username, password, search);
      else getUserRepo(search);
    } else {
      $(".error")
        .removeClass("d-none")
        .addClass("d-block")
        .html("Please enter valid github credentials.");
    }
  });

  $("#createIssueBtn").click(function() {
    let subject = $("#subject").val();
    let desc = $("#desc").val();
    let repoName = localStorage.getItem("repoName");
    let username = localStorage.getItem("username");

    $.ajax({
      type: "POST",
      url: BASE_URL + "repos/" + username + "/" + repoName + "/issues",
      headers: {
        Authorization: localStorage.getItem("accessToken")
      },
      data: JSON.stringify({
        title: subject,
        body: desc
      }),
      success: function(response) {
        $("#subject, #desc").val("");
        $("#success")
          .removeClass("d-none")
          .addClass("d-block")
          .html("Issue has been created successfully!");
      },
      error: function() {
        console.log("Issue not created due to issue.");
        alert("Issue not created due to issue.");
      }
    });
  });
});

function createToken(username, password, search) {
  let tokenName = Math.random()
    .toString(36)
    .substring(2);
  $.ajax({
    url: BASE_URL + "authorizations",
    type: "POST",
    beforeSend: function(xhr) {
      xhr.setRequestHeader(
        "Authorization",
        "Basic " + btoa(username + ":" + password)
      );
    },
    data: JSON.stringify({
      scopes: ["repo"],
      note: tokenName
    })
  }).done(function(response) {
    localStorage.setItem("accessToken", "token " + response.token);
    getUserRepo(search);
  });

  return false;
}

function getUserRepo(search) {
  $.ajax({
    url: BASE_URL + "users/" + search + "/repos",
    headers: {
      Authorization: localStorage.getItem("accessToken")
    },
    success: function(res) {
      showRepo(res);
    },
    error: function() {
      $("#repoList")
        .removeClass("d-block")
        .addClass("d-none");
      console.log("some error occured");
      alert("User not found");
    }
  });
  return false;
}

function showRepo(data) {
  console.log(data);
  let repoList = data;
  let html = "";
  html += '<ul class="list-group">';
  for (let i = 0; i < repoList.length; i++) {
    html +=
      '<li class="list-group-item"><b>' +
      repoList[i].name +
      '</b> <button type="button" class="btn btn-success btn-md float-right new-issue" id="' +
      repoList[i].id +
      '">New Issue</button><p>' +
      repoList[i].full_name +
      "</p>";
    html += "</li>";
  }
  html += "</ul>";
  document.getElementById("repoList").innerHTML = html;

  let buttons = document.getElementsByClassName("new-issue");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", newIssue);
  }
}

function newIssue() {
  let id = this.getAttribute("id");
  let repoName = $("#" + id)
    .parents("li")
    .find("b")
    .text();
  localStorage.setItem("repoName", repoName);
  $("#success")
    .removeClass("d-block")
    .addClass("d-none");
  $(".modal-title").html(`Create Issue for ${repoName}`);
  $("#createIssue").modal("show");
}
