import { Component, OnInit, ViewChild } from "@angular/core";
import { base64ToFile, Dimensions, ImageCroppedEvent, ImageCropperComponent, ImageTransform, LoadedImage } from "ngx-image-cropper";
import { NamedEvent, NamedEventType } from "../models/broadcast.model";
import { BroadcastService } from "../services/broadcast-service";
import { NumberUtilsService } from "../services/number-utils.service";

@Component({
  selector: "app-image-cropper",
  templateUrl: "./image-cropper.html",
  styleUrls: ["./image-cropper.sass"]
})

export class ImageCropperAndResizerComponent implements OnInit {
  @ViewChild(ImageCropperComponent) imageCropperComponent: ImageCropperComponent;
  imageChangedEvent: any = "";
  croppedImage: any = "";
  canvasRotation = 0;
  resizeToWidth = 0;
  rotation = 0;
  scale = 1;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {};
  original: ImageData;
  private maintainQuality = false;
  originalSize = "";
  croppedSize = "";

  constructor(private broadcastService: BroadcastService, private numberUtils: NumberUtilsService) {
  }

  ngOnInit(): void {
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    console.log("fileChangeEvent:event", event);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    console.log("imageCropped:event", event, "base64ToFile:", base64ToFile(event.base64));
    this.croppedSize = this.numberUtils.humanFileSize(this.croppedImage.length);
    this.broadcastService.broadcast(NamedEvent.withData(NamedEventType.IMAGE_CROP, event.base64));
  }

  imageLoaded($event: LoadedImage) {
    this.showCropper = true;
    console.log("Image loaded:", $event);
    this.original = $event.original;
    this.originalSize = this.numberUtils.humanFileSize(this.original.base64.length)
      + " - " + this.numberUtils.humanFileSize(this.original.base64.length, true)
      + " - " + this.numberUtils.humanFileSize2(this.original.base64.length);
    this.setResizeToWidth();
  }

  private setResizeToWidth() {
    this.resizeToWidth = this.maintainQuality ? this.original.size.width : 500;
  }

  cropperReady(sourceImageDimensions: Dimensions) {
    console.log("Cropper ready", sourceImageDimensions);
  }

  loadImageFailed() {
    console.log("Load failed");
  }

  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {};
    this.setResizeToWidth();
  }

  zoomOut() {
    this.scale -= .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  zoomIn() {
    this.scale += .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  updateRotation() {
    this.transform = {
      ...this.transform,
      rotate: this.rotation
    };
  }

  resized($event: UIEvent) {
    console.log("resized:", $event);
  }

  resizeToWidthChanged($event: any) {
    console.log("resizeToWidthChanged:", $event);
    this.imageCropperComponent.crop();
  }

}

interface ImageData {
  base64: string;
  image: HTMLImageElement;
  size: Dimensions;
}
