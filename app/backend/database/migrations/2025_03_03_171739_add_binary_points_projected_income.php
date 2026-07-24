<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBinaryPointsProjectedIncome extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_binary_points', function (Blueprint $table) {
            $table->double("binary_points_projected_income")->default(0)->after("binary_points_income");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_binary_points', function (Blueprint $table) {
            $table->dropColumn('binary_points_projected_income');
        });
    }
}
