"use client";

import FormCreateAlert from "../../components/FormCreateAlert"

export default async function Page() {

  return (
    <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        <FormCreateAlert></FormCreateAlert>
      </div>
    </div>
  );

// export default async function Page() {

//   return (
//     <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
//       <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        
//       </div>
//     </div>
//   );
// }