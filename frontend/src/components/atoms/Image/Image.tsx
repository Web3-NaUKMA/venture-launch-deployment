import { FC, ImgHTMLAttributes, ReactNode } from 'react';
import defaultFallback from '../../../../public/logo.png';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  emptySrcFallback?: ReactNode;
}

const Image: FC<ImageProps> = ({
  src,
  emptySrcFallback,
  fallbackSrc = defaultFallback,
  alt,
  ...props
}) => {
  if (!src) return emptySrcFallback;

  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={event => {
        event.currentTarget.src = fallbackSrc;
      }}
    />
  );
};

export default Image;
