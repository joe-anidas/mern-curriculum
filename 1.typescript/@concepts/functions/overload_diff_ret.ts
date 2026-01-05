type ApiSuccess = {
  success: true;
  data: string;
};

type ApiError = {
  success: false;
  error: string;
};

function formatResponse(success: true, data: string): ApiSuccess;
function formatResponse(success: false, error: string): ApiError;

function formatResponse(success: boolean, value: string) {
  if (success) {
    return { success: true, data: value };
  }
  return { success: false, error: value };
}

console.log(formatResponse(true, "User fetched"));
console.log(formatResponse(false, "User not found"));
