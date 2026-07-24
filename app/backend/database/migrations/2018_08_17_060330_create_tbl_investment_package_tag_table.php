<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblInvestmentPackageTagTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_investment_package_tag', function (Blueprint $table) {
            $table->increments('investment_package_tag_id');
            $table->string('investment_amount');
            $table->string('investment_date');
            $table->integer('investment_package_id');
            $table->integer('slot_id');
            $table->integer('user_id');
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
        Schema::dropIfExists('tbl_investment_package_tag');
    }
}
