using System.Collections.Generic;
using static Backend.Utilities.Constants;

namespace Backend.Utilities
{
    public static class AppInsightsTool
    {
        public static class Traces
        {
            public const string BORROW_BOOK = "BorrowBook";
            public const string RETURN_BOOK = "ReturnBook";

            public const string GET_ALL_LOANS = "GET_All_Loans";
            public const string GET_ALL_LOANS_FOR_USER = "GetAllLoansForUser";
        }

        public class Props
        {
            public const string BOOK_ID = "BookId";
            public const string BOOK_TITLE = "BookTitle";
            public const string LOAN_ID = "LoanId";
            public const string USER_ID = "UserId";
            public const string TIME_TAKEN_MS = "TimeTakenMs";
        }


        public static IDictionary<string, string> CreateTrackProperties(ExecutionResult result, string resultMsg, string packageKey, string packageValue)
        {
            return new Dictionary<string, string> {
                { result.ToString(), resultMsg },
                { packageKey, packageValue }
            };
        }

        public static IDictionary<string, string> SingleProperty(string k, string v)
        {
            return new Dictionary<string, string> { { k, v } };
        }
    }



}
