import { Injectable } from '@nestjs/common';

import { cloudinary } from '../cloudinary';

@Injectable()
export class UploadsService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'planora/events',
    });

    return result.secure_url;
  }
}
