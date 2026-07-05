import React from 'react';
import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';

const colorStyles = {
  primary: {
    iconBg: 'bg-primary-100 dark:bg-primary-950/40',
    iconText: 'text-primary-600 dark:text-primary-400',
    gradient: 'from-primary-50/60 to-white dark:from-slate-900 dark:to-slate-900',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-50/60 to-white dark:from-slate-900 dark:to-slate-900',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-950/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-50/60 to-white dark:from-slate-900 dark:to-slate-900',
  },
  rose: {
    iconBg: 'bg-rose-100 dark:bg-rose-950/40',
    iconText: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-50/60 to-white dark:from-slate-900 dark:to-slate-900',
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-950/40',
    iconText: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-50/60 to-white dark:from-slate-900 dark:to-slate-900',
  },
  sky: {
    iconBg: 'bg-sky-100 dark:bg-sky-950/40',
    iconText: 'text-sky-600 dark:text-sky-400',
    gradient: 'from-sky-50/60 to-white dark:from-slate-900 dark:to-slate-900',
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary',
  className = '',
}) => {
  const palette = colorStyles[color] || colorStyles.primary;
  const isTrendPositive = trend != null && trend >= 0;
  const formattedTrend =
    trend != null
      ? `${isTrendPositive ? '+' : ''}${Number(trend).toFixed(1)}%`
      : null;

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800 shadow-card',
        'bg-gradient-to-br',
        palette.gradient,
        'p-6',
        'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-heading tracking-tight">
            {value}
          </p>

          {/* Trend */}
          {formattedTrend && (
            <div className="flex items-center gap-1.5 mt-2">
              {isTrendPositive ? (
                <HiArrowTrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <HiArrowTrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={[
                  'text-xs font-semibold',
                  isTrendPositive ? 'text-emerald-600' : 'text-red-600',
                ].join(' ')}
              >
                {formattedTrend}
              </span>
              {trendLabel && (
                <span className="text-xs text-gray-400 dark:text-slate-550">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={[
              'flex items-center justify-center w-12 h-12 rounded-xl',
              palette.iconBg,
              'flex-shrink-0',
            ].join(' ')}
          >
            {React.isValidElement(Icon) ? (
              React.cloneElement(Icon, {
                className: `w-6 h-6 ${palette.iconText} ${Icon.props.className || ''}`,
                'aria-hidden': 'true'
              })
            ) : (
              <Icon className={`w-6 h-6 ${palette.iconText}`} aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {/* Decorative circle */}
      <div
        className={[
          'absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-[0.07]',
          palette.iconBg.replace('100', '400').split(' ')[0], // only take the light class or modify it safely
        ].join(' ')}
        aria-hidden="true"
      />
    </div>
  );
};

export default StatCard;
