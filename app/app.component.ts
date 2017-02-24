import { Component, NgZone, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import {session, Session, Task} from "nativescript-background-http";
import {knownFolders, path } from "file-system";
import {Page} from "ui/page";
import {Image} from "ui/image";
import {Progress} from "ui/progress";
import {fromFile, ImageSource} from "image-source";
let imagepicker = require("nativescript-imagepicker");
import {ObservableArray} from "data/observable-array"
import {Observable} from "data/observable"
class tmpTask{
    upload: number;

    totalUpload: number;
}


@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})
export class AppComponent { 

    items:ObservableArray<Result>;
    public newsession:Session;
    public fileURL:string="";
    public request:any;
    public imageName:string="logo";
    private documents;
    public imageSrc ="~/logo.png";
    public counter = 0;

    @ViewChild("myImage") myImageRef: ElementRef;

    constructor(private page:Page, private zone:NgZone, private _changeDetectionRef: ChangeDetectorRef){
         this.documents = knownFolders.currentApp();
         this.fileURL = this.documents.path+"/logo.png";
         this.newsession = session("image-upload");

         this.items = new ObservableArray<Result>();
         
    }
    // multiUpload(){
    //     var progress:Progress =<Progress> this.page.getViewById("prgressmultiid");
    //         progress.value = 0;
    //     var params = [{name: "test", value: "value"}, {name:"fileToUpload", filename: this.fileURL, mimeType: 'image/png'}];
    //    this.task = this.newsession.multipartUpload(params, this.request);
    //    this.task.on("progress", (e)=>{
    //         var progress:Progress =<Progress> this.page.getViewById("prgressmultiid");
    //         progress.value = e.currentBytes;
    //         progress.maxValue = e.totalBytes;
    //    });
    //    this.task.on("error", this.logEvent);
    //    this.task.on("complete", this.logEvent);
    // }
    imageUplaod(fileUri, uri):Task{

        let request = {
            url: "http://httpbin.org/post",
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream",
                "File-Name": uri
            },
            description: "{ 'uploading': " + uri + " }"
        };
        // var progress:Progress =<Progress> this.page.getViewById("prgressid");
        //     progress.value = 0;
       let task = this.newsession.uploadFile(fileUri, request);
       task.on("progress", (e)=>{
            // var progress:Progress =<Progress> this.page.getViewById("prgressid");
            // progress.value = e.currentBytes;
            // progress.maxValue = e.totalBytes;
            console.log("currentBytes "+e.currentBytes);
            console.log("totalBytes "+e.totalBytes);
       });
       task.on("error", this.logEvent);
       task.on("complete", this.logEvent);

       return task;
       
    }
    logEvent(e) {
        switch (e.eventName) {
            case "complete":
                alert("Upload complete");
                break;
            case "error":
                alert("Upload error"+e)
                break;
        
            default:
                break;
        }

        
       
        
    }

    onSelectMultipleTap() {
        let context = imagepicker.create({
            mode: "multiple"
        });
        this.startSelection(context);
    }

    onSelectSingleTap() {
        let context = imagepicker.create({
            mode: "single"
        });
        this.startSelection(context);
    }

    startSelection(context) {
        context
            .authorize()
            .then(() => {
                
                return context.present();
            })
            .then((selection) => {
                console.log("Selection done:");
                selection.forEach((selected)=>{
                    selected.getImage().then((imagesource)=>{
                        console.log("----------------");
                        console.log("uri: " + selected.uri);
                        console.log("fileUri: " + selected.fileUri);
                        let folder = knownFolders.documents();
                        let pathfile = path.join(folder.path, "Test"+this.counter+".png");
                        let saved = imagesource.saveToFile(pathfile, "png");
                        console.log(pathfile)
                        
                        if(saved){
                            var task =this.imageUplaod(pathfile, selected.uri);
                            task.upload;
                            task.totalUpload;
                            var tmp = new Observable();
                            tmp.set("task", task)
                            this.items.push(new Result(selected.uri, selected.fileUri, imagesource, tmp));
                        }
                        this.counter++;
                        
                        
                        
                        
                    })
                    
                });
                
                this._changeDetectionRef.detectChanges();
            }).catch(function (e) {
                console.log(e);
            });
    }
}

class Result{
    constructor(public uri:string, public fileUri, public image:ImageSource, public task:Observable){
    }
}