const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  iconClass = "bg-blue-500/10 text-blue-400",
}) => {
  return (
    <div className="group bg-slate-900 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h3 className="text-2xl sm:text-3xl font-bold mt-2">
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