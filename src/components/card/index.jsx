function Card(props) {
  const { variant, extra, children, ...rest } = props;
  return (
    <div
      className={`studio-app-card relative flex flex-col rounded-2xl bg-white bg-clip-border dark:!bg-navy-800 dark:text-white ${extra || ""}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
