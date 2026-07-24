<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EditTblCodes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasColumn('tbl_codes', 'code_sold_to'))
        {
            Schema::table('tbl_codes', function($table) 
            {
                $table->dropForeign('tbl_codes_code_sold_to_foreign');
            });
        }

        if (Schema::hasColumn('tbl_codes', 'code_sold_to'))
        {
            Schema::table('tbl_codes', function($table) 
            {
                $table->dropColumn('code_sold_to');
            });
        }

        if (Schema::hasColumn('tbl_codes', 'code_date_sold'))
        {
            Schema::table('tbl_codes', function($table) 
            {
                $table->dropColumn('code_date_sold');
            });
        }

        if (Schema::hasColumn('tbl_codes', 'code_date_used'))
        {
            Schema::table('tbl_codes', function($table) 
            {
                $table->dropColumn('code_date_used');
            });
        } 
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        
            
        
    }
}
