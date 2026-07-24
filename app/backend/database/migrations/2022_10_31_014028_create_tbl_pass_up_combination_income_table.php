<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblPassUpCombinationIncomeTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_pass_up_combination_income', function (Blueprint $table) {
            $table->integer('membership_id')->default(0);
            $table->integer('membership_entry_id')->default(0);
            $table->double('pass_up_income')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_pass_up_combination_income');
    }
}
