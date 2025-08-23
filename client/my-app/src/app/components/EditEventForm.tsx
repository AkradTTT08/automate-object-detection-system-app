"use client";
import React, { useState, useRef } from "react";

interface EditEventForm {
  eventId: number;
  eventName: string;
  eventDescription?: string;
  eventIcon?: string;
}

export default function EditEventModal({ eventId, eventName = "Sample Event", eventDescription = "", eventIcon = "", }: EditEventForm) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [name, setName] = useState(eventName);
  const [description, setDescription] = useState("");
  const [enableDetection, setEnableDetection] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sensitivity, setSensitivity] = useState("Medium");
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันเมื่อกดปุ่ม Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, description, enableDetection, file, sensitivity });
    alert("Saved! ดู console.log");
    setIsOpen(false);
  };

  // ฟังก์ชันเมื่อกดปุ่ม Upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ฟังก์ชันเมื่อเลือกไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div>
      {/* ปุ่มเปิด Modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Test Edit Event
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">

            {/* ปุ่มปิด */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-blue-600 text-sm font-medium mb-4">
              Edit Event: <span className="font-normal">{name}</span>
            </h2>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSave}>

              {/* Event Name + Upload */}
              <div>
                <label htmlFor="eventName" className="block text-gray-900 text-sm font-normal mb-1">
                  Event Name<span className="text-red-600">*</span>
                </label>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                  <button
                    type="button"
                    className="flex items-center justify-center px-3 border-r border-gray-300 text-gray-500 text-xs font-normal"
                    onClick={handleUploadClick}
                  >
                    Upload Icon
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <input
                    id="eventName"
                    name="eventName"
                    type="text"
                    placeholder="Enter event name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 py-2 px-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none"
                  />
                </div>
                {file && <p className="text-sm mt-1 text-gray-600">Selected file: {file.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-gray-900 text-sm font-normal mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Enter event description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 text-sm resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex gap-4">

                {/* Sensitivity */}
                <div className="flex-1 flex flex-col relative">
                  <label
                    htmlFor="sensitivity"
                    className="text-gray-900 text-sm font-normal mb-1"
                  >
                    Sensitivity
                  </label>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-md flex justify-between items-center text-gray-900 text-sm bg-white"
                  >
                    {sensitivity}
                    <i className={`fi ${dropdownOpen ? 'fi-tr-angle-small-up' : 'fi-tr-angle-small-down'} arrow`}></i>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-md z-20">
                      <ul>
                        {['High', 'Medium', 'Low'].map((level) => (
                          <li key={level}>
                            <button
                              className="w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                              onClick={() => {
                                setSensitivity(level);
                                setDropdownOpen(false);
                              }}
                            >
                              {level}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Enable Detection */}
                <div className="flex-1 flex flex-col items-start">
                  <label
                    htmlFor="enableDetection"
                    className="text-gray-900 text-sm font-normal mb-1"
                  >
                    Enable Detection
                  </label>
                  <input
                    type="checkbox"
                    id="enableDetection"
                    checked={enableDetection}
                    onChange={() => setEnableDetection(!enableDetection)}
                    className="relative w-10 h-5 bg-gray-300 rounded-full appearance-none cursor-pointer transition-colors
                 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:w-4 before:h-4
                 before:bg-white before:rounded-full before:shadow-sm before:transition-transform
                 checked:bg-blue-500 checked:before:translate-x-5"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-18 h-7 border border-gray-300 rounded-sm text-gray-900 hover:bg-gray-100 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center w-30 h-7 bg-blue-600 text-white rounded-sm hover:bg-blue-700 text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
