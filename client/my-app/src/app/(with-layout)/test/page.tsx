// Page ใช้สำหรับดึง component มาแสดงผลเพื่อทดสอบ
'use client';

import RegisterForm from "../../components/RegisterForm";

export default function Page() {

  return (
    <div className="flex flex-col gap-4">
        <RegisterForm></RegisterForm>
    </div>
  );
}