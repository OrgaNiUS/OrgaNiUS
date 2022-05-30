import React from "react";

const SettingsModal = ({ title, text }: { title: string; text: string }): JSX.Element => {
  return (
    // onClick outer div to trigger close
    <div
      className="
        flex
        justify-center
        items-center
        text-center
        min-h-screen
        fixed
        w-full
        h-full
        bg-black/70
        z-50
      "
    >
      <div
        className="
        flex
        flex-wrap
        flex-col
        w-80
        bg-white
        py-5
      "
      >
        {title}
      </div>
    </div>
  );
};

export default SettingsModal;
