import path from 'path';
import { UploadFileOptions } from '../types/core/file.types';
import { mkdirSync, rmSync, writeFile } from 'fs';

export const uploadSingleFile = async (file: Express.Multer.File, options?: UploadFileOptions) => {
  mkdirSync(
    path.join(`./src/public`, options?.destination ? `uploads/${options.destination}` : file.path),
    {
      recursive: true,
    },
  );

  writeFile(
    path.join(
      `./src/public`,
      options?.destination ? `uploads/${options.destination}` : file.path,
      file.originalname,
    ),
    file.buffer,
    'binary',
    error => {
      if (error) console.log(error);
    },
  );
};

export const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  options?: UploadFileOptions,
) => {
  for (const file of files) {
    await uploadSingleFile(file, options);
  }
};

export const deleteFolder = async (directoryPath: string) => {
  rmSync(path.join(`./src/public`, directoryPath), { recursive: true, force: true });
};
