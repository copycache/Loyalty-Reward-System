<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblInvestmentPackageTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_investment_package', function (Blueprint $table) {
            $table->increments('investment_package_id');
            $table->integer('investment_package_days_bond');
            $table->integer('investment_package_min_interest');
            $table->integer('investment_package_max_interest');
            $table->integer('investment_package_days_margin');
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
        Schema::dropIfExists('tbl_investment_package');
    }
}
