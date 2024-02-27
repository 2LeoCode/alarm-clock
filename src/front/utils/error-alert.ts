import Swal from "sweetalert2";

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : "An unknown error occurred";
};

export const errorAlert = (error: unknown) => {
  Swal.fire({
    title: "Error",
    text: getErrorMessage(error),
    icon: "error",
  });
};
