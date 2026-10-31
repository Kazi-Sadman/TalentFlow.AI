namespace TalentFlow.Api.Common
{
    public static class PagingHelper
    {
        public const int DefaultPageSize = 10;
        public const int MaxPageSize = 50;

        public static int FixPage(int page)
        {
            if (page < 1)
            {
                return 1;
            }
            return page;
        }

        public static int FixPageSize(int pageSize)
        {
            if (pageSize < 1)
            {
                return DefaultPageSize;
            }
            if (pageSize > MaxPageSize)
            {
                return MaxPageSize;
            }
            return pageSize;
        }
    }
}
