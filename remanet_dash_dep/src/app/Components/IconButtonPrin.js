"use client";

import React from "react";

const IconP = ({ icon, action, disabled }) => {
  return (
    <div className="flex items-center justify-center ">
        <button
          type="button"
          onClick={action}
          className={!disabled? "inline-flex items-center justify-center w-24 h-24 shadow-2xl shadow-black-500 bg-[#41463b] cursor-pointer rounded-full hover:bg-slate-500 group " : " inline-flex items-center justify-center w-24 h-24 shadow-2xl shadow-black-500 cursor-not-allowed rounded-full bg-slate-200 group"}
          disabled={disabled}

        >
          {icon}
        </button>
    </div>
  );
};

export default IconP;
