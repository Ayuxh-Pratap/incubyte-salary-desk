CREATE TABLE "countries" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"code" text PRIMARY KEY NOT NULL,
	"precision" integer NOT NULL,
	CONSTRAINT "currency_precision" CHECK ("currencies"."precision" between 0 and 3)
);
--> statement-breakpoint
CREATE TABLE "department_roles" (
	"department_id" text NOT NULL,
	"role_id" text NOT NULL,
	CONSTRAINT "department_roles_department_id_role_id_pk" PRIMARY KEY("department_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" integer PRIMARY KEY NOT NULL,
	"employee_number" text NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"department" text NOT NULL,
	"role" text NOT NULL,
	"currency" text NOT NULL,
	"period" text DEFAULT 'annual' NOT NULL,
	"salary_minor" bigint NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text DEFAULT 'Synthetic seed' NOT NULL,
	CONSTRAINT "employees_employee_number_unique" UNIQUE("employee_number"),
	CONSTRAINT "positive_bounded_salary" CHECK ("employees"."salary_minor" > 0 and "employees"."salary_minor" <= 9000000000000000000),
	CONSTRAINT "annual_salary_only" CHECK ("employees"."period" = 'annual'),
	CONSTRAINT "positive_version" CHECK ("employees"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "salary_desk_environment" (
	"id" integer PRIMARY KEY NOT NULL,
	"purpose" text NOT NULL,
	CONSTRAINT "singleton_environment" CHECK ("salary_desk_environment"."id" = 1),
	CONSTRAINT "valid_purpose" CHECK ("salary_desk_environment"."purpose" in ('development','test','demo','preview'))
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "department_roles" ADD CONSTRAINT "department_roles_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "department_roles" ADD CONSTRAINT "department_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_country_countries_code_fk" FOREIGN KEY ("country") REFERENCES "public"."countries"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_departments_id_fk" FOREIGN KEY ("department") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_role_roles_id_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_currency_currencies_code_fk" FOREIGN KEY ("currency") REFERENCES "public"."currencies"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "employee_name_id_idx" ON "employees" USING btree ("name","id");--> statement-breakpoint
CREATE INDEX "employee_currency_salary_id_idx" ON "employees" USING btree ("currency","salary_minor","id");--> statement-breakpoint
CREATE INDEX "employee_country_department_idx" ON "employees" USING btree ("country","department");--> statement-breakpoint
CREATE INDEX "employee_department_role_idx" ON "employees" USING btree ("department","role");