function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('forms.html').setTitle("Subida de archivo a Google Drive");
}

function doPost(e) {
  if (!e || !e.parameters || !e.parameters.filename || !e.parameters.file) {
    return message("Error: Bad parameters");
  } else {
    try{
      var folder = getFolder("ExchangeFiles");
    } catch (f){
      return message("Error: geting folder "+catchToString(f));
    }

    try{
      var data = e.parameters.file.toString(),
          dateStr = Utilities.formatDate(new Date(), 'Etc/GMT', 'yyyyMMdd\'T\'HHmmssSSS\'Z\'');
    } catch (f){
      return message("Error: geting data "+catchToString(f));
    }

    try{
      var contentType = data.substring(5,data.indexOf(';')),
          bytes = Utilities.base64Decode(data.substr(data.indexOf('base64,')+7)),
          blob = Utilities.newBlob(bytes, contentType, e.parameters.filename),
          file = folder.createFolder([dateStr, 'file'].join(" ")).createFile(blob);
    } catch (f){
      return message("Error: processing file "+catchToString(f));
    }
    try{
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return returnObject("All done",{downloadUrl: file.getDownloadUrl(), url: file.getUrl(), fileId:file.getId(), folder: [dateStr, 'file'].join(" ")});
    } catch (f){
      return message("Error: seting file permission "+catchToString(f));
    }
  }
}

function getFolder(fName){
  var folder, folders = DriveApp.getFoldersByName(fName);
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(fName);
  }
  return folder;
}

function catchToString (err) {
  var errInfo = "Catched something:\n"; 
  for (var prop in err)  {  
    errInfo += "  property: "+ prop+ "\n    value: ["+ err[prop]+ "]\n"; 
  } 
  errInfo += "  toString(): " + " value: [" + err.toString() + "]"; 
  return errInfo;
}

function returnObject(msg, variable) {
  return ContentService.createTextOutput(JSON.stringify({result: msg, data: variable})).setMimeType(ContentService.MimeType.JSON);
}

function debug(variable) {
  return ContentService.createTextOutput(JSON.stringify(variable).setMimeType(ContentService.MimeType.JSON);
}

function message(msg) {
  return ContentService.createTextOutput(JSON.stringify({result: msg})).setMimeType(ContentService.MimeType.JSON);
}