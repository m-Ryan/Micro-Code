interface Options {
  count?: number;
  accept?: string;
  minSize?: number;
  maxSize?: number;
  autoUpload?: boolean;
}
interface UploaderOption extends Options {
  count: number;
}

const enum UploaderEvent {
  BEFORE = 'before',
  PROGRESS = 'progress',
  END = 'end'
}

interface IUploadHandler {
  [UploaderEvent.BEFORE]?: () => void;
  [UploaderEvent.PROGRESS]?: (urls: string[])=> void;
  [UploaderEvent.END]?: (urls: string[])=>void;
}

type UploaderServer = (file: File) => Promise<string>

export default class Uploader {
  private options: UploaderOption;
  private el: HTMLInputElement;
  private uploadServer: UploaderServer;
  private urls: string[] = [];
  private handler:IUploadHandler = {};

  constructor(uploadServer: UploaderServer, options: Options) {
    this.options = { 
      count: 1,
      autoUpload: true, 
      ...options 
    };
    this.uploadServer = uploadServer;
    this.el = this.createInput();
    this.chooseFile();
  }

  private createInput() {
    Array.from(document.querySelectorAll('.uploader-form-input')).forEach(
      el => {
        document.body.removeChild(el);
      },
    );
    const el = document.createElement('input');
    el.className = 'uploader-form-input';
    el.type = 'file';
    el.style.display = 'block';
    el.style.opacity = '0';
    el.style.width = '0';
    el.style.height = '0';
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    el.style.overflow = 'hidden';
    el.multiple = this.options.count > 1;
    if (this.options.accept) {
      el.accept = this.options.accept;
    }
    return el;
  }

  private async uploadFiles(files: File[]) {
    const results = files.map(file => ({ file }));
    const urls: string[] = [];

    // 开始上传
    this.handler[UploaderEvent.BEFORE]();

    // 上传中
    await Promise.all(results.map((async(file)=>{
      const url = await this.uploadFile(file);
      this.urls.push(url)
      this.handler[UploaderEvent.PROGRESS](urls);
    })))
    // 上传完成
    this.handler[UploaderEvent.END](urls);
    return urls;
  }

  private async uploadFile(result: { file: File }) {
    return this.uploadServer(result.file);
  }

  private checkFile(files: File[]) {
    const typeError = this.checkTypes(files);
    if (typeError) {
      throw new Error(typeError);
    }

    const sizeError = this.checkSize(files);
    if (sizeError) {
      throw new Error(sizeError);
    }
  }

  private checkTypes(files: File[]) {
    const accept = this.options.accept;
    if (accept) {
      let fileType = '';
      if (accept.indexOf('image') !== -1) {
        fileType = 'image';
      } else if (accept.indexOf('video') !== -1) {
        fileType = 'video';
      }
      for (let file of files) {
        if (file.type.indexOf(fileType) !== 0) {
          return '上传文件类型错误!';
        }
      }
    }
    return null;
  }


  private checkSize(files: File[]) {
    const options = this.options;
    for (let file of files) {
      if (options.minSize && file.size < options.minSize) {
        return `上传文件不能小于 ${options.minSize}`;
      }
      if (options.maxSize && file.size > options.maxSize) {
        return `上传文件不能小于 ${options.maxSize}`;
      }
    }
    return null;
  }

  private chooseFile() {
    let el = this.el;
    document.body.appendChild(el);
    el.click();

    el.onchange = async (e: any) => {
      let files = e.target.files || [];
      files = Array.prototype.slice.call(files);
      if (files.length === 0) {
        return;
      }
      this.checkFile(files);
      if (this.options.autoUpload) {
        this.uploadFiles(files);
      } 
      el.onchange = null;
      document.body.removeChild(el);
    };

  }

  public on<T extends UploaderEvent>(event: T, fn: IUploadHandler[T]) {
    this.handler[event] = fn;
  }

  public off<T extends UploaderEvent>(event: T) {
    delete this.handler[event];
  }
}
