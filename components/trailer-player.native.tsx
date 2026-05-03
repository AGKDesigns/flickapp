import YoutubePlayer from "react-native-youtube-iframe";

type Props = {
  videoId: string;
  width: number;
  height: number;
  onEnd?: () => void;
};

export function TrailerPlayer({ videoId, width, height, onEnd }: Props) {
  return (
    <YoutubePlayer
      videoId={videoId}
      height={height}
      width={width}
      play
      onChangeState={(state: string) => {
        if (state === "ended") onEnd?.();
      }}
    />
  );
}
