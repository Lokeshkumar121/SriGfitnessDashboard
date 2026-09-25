const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  iconClass = "bg-blue-50 text-blue-600",
}) => {
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-slate-900">
            {value}
          </h3>

          {description && (
            <p className="text-xs text-slate-500 mt-2">
              {description}
            </p>
          )}
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;