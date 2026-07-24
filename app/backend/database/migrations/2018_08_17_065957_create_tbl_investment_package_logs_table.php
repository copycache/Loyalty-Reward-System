<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblInvestmentPackageLogsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_investment_package_logs', function (Blueprint $table) {
            $table->increments('investment_package_logs_id');
            $table->string('investment_package_logs_date');
            $table->string('investment_package_logs_amount');
            $table->integer('investment_package_tag_id');
            $table->tinyInteger('archive')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_investment_package_logs');
    }
}
