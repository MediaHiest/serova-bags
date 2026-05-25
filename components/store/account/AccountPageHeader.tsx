interface AccountPageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function AccountPageHeader({ title, description, action }: AccountPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        <h2 className="page-title text-2xl md:text-3xl lg:text-4xl text-text-dark">{title}</h2>
        {description && (
          <p className="text-base text-text-muted mt-2 font-normal leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
